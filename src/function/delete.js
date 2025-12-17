import { Tokenizer } from "../Tokenizer.js";
import { CSTBuilder } from "../CSTBuilder.js";
import { resolvePath } from "../PathResolver.js";
import { parsePath, extractString } from "../helper.js";

/**
 * Removes properties from objects or elements from arrays in a JSON string while preserving formatting, comments, and whitespace.
 * 
 * @param {string} sourceText - The original JSON string to modify
 * @param {Array<{path: string}>} patches - Array of deletion operations to apply
 * @param {string} patches[].path - JSON path to the property or element to delete (supports dot notation like "a.b.c" or JSON Pointer like "/a/b/c")
 * @returns {string} The modified JSON string with specified paths removed
 * 
 * @example
 * // Remove an object property
 * remove('{"a": 1, "b": 2}', [{ path: "b" }]);
 * // Returns: '{"a": 1}'
 * 
 * @example
 * // Remove an array element
 * remove('{"items": [1, 2, 3]}', [{ path: "items[1]" }]);
 * // Returns: '{"items": [1, 3]}'
 * 
 * @example
 * // Remove nested property
 * remove('{"user": {"name": "Alice", "age": 30}}', [{ path: "user.age" }]);
 * // Returns: '{"user": {"name": "Alice"}}'
 * 
 * @example
 * // Batch deletions
 * remove('{"a": 1, "b": 2, "c": 3}', [{ path: "a" }, { path: "c" }]);
 * // Returns: '{"b": 2}'
 */
export function remove(sourceText, patches) {
	const tokenizer = new Tokenizer(sourceText);
	const tokens = tokenizer.tokenize();

	const builder = new CSTBuilder(tokens);
	const root = builder.build();

	// 倒叙删除
	const reverseNodes = patches
		.map((patch) => {
			const pathParts = parsePath(patch.path);
			if (pathParts.length === 0) {
				return null; // Cannot delete root
			}

			// Find parent and the item to delete
			const parentPath = pathParts.slice(0, -1);
			const lastKey = pathParts[pathParts.length - 1];
			const parentNode = parentPath.length > 0 ? resolvePath(root, parentPath, sourceText) : root;

			if (!parentNode) return null;

			return {
				parentNode,
				lastKey,
				patch,
			};
		})
		.filter((v) => v !== null)
		.sort((a, b) => {
			// Sort by the start position of what we're deleting
			const aStart = getDeleteStart(a.parentNode, a.lastKey, sourceText);
			const bStart = getDeleteStart(b.parentNode, b.lastKey, sourceText);
			return bStart - aStart;
		});

	let result = sourceText;

	for (const { parentNode, lastKey } of reverseNodes) {
		result = deleteFromParent(result, parentNode, lastKey, sourceText);
	}

	return result;
}

function getDeleteStart(parentNode, key, sourceText) {
	if (parentNode.type === "Object") {
		for (const prop of parentNode.properties) {
			const keyStr = extractString(prop.key, sourceText);
			if (keyStr === key) {
				return prop.key.start;
			}
		}
	} else if (parentNode.type === "Array") {
		if (typeof key === "number" && key >= 0 && key < parentNode.elements.length) {
			return parentNode.elements[key].start;
		}
	}
	return 0;
}

function deleteObjectProperty(sourceText, objectNode, key, originalSource) {
	let propIndex = -1;
	for (let i = 0; i < objectNode.properties.length; i++) {
		const keyStr = extractString(objectNode.properties[i].key, originalSource);
		if (keyStr === key) {
			propIndex = i;
			break;
		}
	}

	if (propIndex === -1) return sourceText;

	const prop = objectNode.properties[propIndex];
	let deleteStart = prop.key.start;
	let deleteEnd = prop.value.end;

	// Handle comma and whitespace
	if (propIndex < objectNode.properties.length - 1) {
		// Not the last property, look for comma after
		let pos = deleteEnd;
		while (
			pos < sourceText.length &&
			(sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")
		) {
			pos++;
		}
		if (sourceText[pos] === ",") {
			deleteEnd = pos + 1;
			// Skip trailing whitespace after comma
			while (
				deleteEnd < sourceText.length &&
				(sourceText[deleteEnd] === " " ||
					sourceText[deleteEnd] === "\t" ||
					sourceText[deleteEnd] === "\n" ||
					sourceText[deleteEnd] === "\r")
			) {
				deleteEnd++;
			}
		}
	} else if (propIndex > 0) {
		// Last property, look for comma before (and whitespace before the comma)
		let pos = deleteStart - 1;
		// Skip whitespace before the property
		while (pos >= 0 && (sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")) {
			pos--;
		}
		if (sourceText[pos] === ",") {
			// Also skip whitespace before the comma
			let commaPos = pos;
			pos--;
			while (
				pos >= 0 &&
				(sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")
			) {
				pos--;
			}
			deleteStart = pos + 1;
		}
	}

	return sourceText.slice(0, deleteStart) + sourceText.slice(deleteEnd);
}

function deleteArrayElement(sourceText, arrayNode, index, originalSource) {
	if (typeof index !== "number" || index < 0 || index >= arrayNode.elements.length) {
		return sourceText;
	}

	const element = arrayNode.elements[index];
	let deleteStart = element.start;
	let deleteEnd = element.end;

	// Handle comma and whitespace
	if (index < arrayNode.elements.length - 1) {
		// Not the last element, look for comma after
		let pos = deleteEnd;
		while (
			pos < sourceText.length &&
			(sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")
		) {
			pos++;
		}
		if (sourceText[pos] === ",") {
			deleteEnd = pos + 1;
			// Skip trailing whitespace after comma
			while (
				deleteEnd < sourceText.length &&
				(sourceText[deleteEnd] === " " ||
					sourceText[deleteEnd] === "\t" ||
					sourceText[deleteEnd] === "\n" ||
					sourceText[deleteEnd] === "\r")
			) {
				deleteEnd++;
			}
		}
	} else if (index > 0) {
		// Last element, look for comma before (and whitespace before the comma)
		let pos = deleteStart - 1;
		// Skip whitespace before the element
		while (pos >= 0 && (sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")) {
			pos--;
		}
		if (sourceText[pos] === ",") {
			// Also skip whitespace before the comma
			let commaPos = pos;
			pos--;
			while (
				pos >= 0 &&
				(sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")
			) {
				pos--;
			}
			deleteStart = pos + 1;
		}
	}

	return sourceText.slice(0, deleteStart) + sourceText.slice(deleteEnd);
}

function deleteFromParent(sourceText, parentNode, key, originalSource) {
	if (parentNode.type === "Object") {
		return deleteObjectProperty(sourceText, parentNode, key, originalSource);
	} else if (parentNode.type === "Array") {
		return deleteArrayElement(sourceText, parentNode, key, originalSource);
	}
	return sourceText;
}
