import { Tokenizer } from "../Tokenizer.js";
import { CSTBuilder } from "../CSTBuilder.js";
import { resolvePath } from "../PathResolver.js";
import { extractString } from "../helper.js";

/**
 * Inserts new properties into objects or elements into arrays in a JSON string while preserving formatting, comments, and whitespace.
 * 
 * @param {string} sourceText - The original JSON string to modify
 * @param {Array<{path: string, key?: string, value: string, position?: number}>} patches - Array of insertion operations to apply
 * @param {string} patches[].path - JSON path where the insertion should occur (supports dot notation like "a.b" or JSON Pointer like "/a/b")
 * @param {string} [patches[].key] - For object insertion: the key name for the new property (required when inserting into objects)
 * @param {string} patches[].value - The value to insert (must be a valid JSON value as a string)
 * @param {number} [patches[].position] - For array insertion: the index where to insert the value (0-based, defaults to appending at the end)
 * @returns {string} The modified JSON string with new values inserted
 * @throws {Error} If inserting into an object without providing a key
 * @throws {Error} If the key already exists in the object
 * @throws {Error} If the position is out of bounds for array insertion
 * 
 * @example
 * // Insert property into object
 * insert('{"name": "Alice"}', [{ path: "", key: "age", value: "30" }]);
 * // Returns: '{"name": "Alice", "age": 30}'
 * 
 * @example
 * // Insert element at array position
 * insert('{"items": [1, 3]}', [{ path: "items", position: 1, value: "2" }]);
 * // Returns: '{"items": [1, 2, 3]}'
 * 
 * @example
 * // Append to array (position omitted)
 * insert('{"items": [1, 2]}', [{ path: "items", value: "3" }]);
 * // Returns: '{"items": [1, 2, 3]}'
 * 
 * @example
 * // Insert nested property
 * insert('{"user": {"name": "Alice"}}', [{ path: "user", key: "email", value: '"alice@example.com"' }]);
 * // Returns: '{"user": {"name": "Alice", "email": "alice@example.com"}}'
 */
export function insert(sourceText, patches) {
	const tokenizer = new Tokenizer(sourceText);
	const tokens = tokenizer.tokenize();

	const builder = new CSTBuilder(tokens);
	const root = builder.build();

	// 倒叙插入
	const reverseNodes = patches
		.map((patch) => {
			const node = resolvePath(root, patch.path, sourceText);
			return {
				node,
				patch,
			};
		})
		.filter((v) => v.node)
		.sort((a, b) => b.node.start - a.node.start);

	let result = sourceText;

	for (const { node, patch } of reverseNodes) {
		result = insertIntoNode(result, node, patch, sourceText);
	}

	return result;
}

function insertIntoNode(sourceText, node, patch, originalSource) {
	if (node.type === "Object") {
		return insertObjectProperty(sourceText, node, patch, originalSource);
	} else if (node.type === "Array") {
		return insertArrayElement(sourceText, node, patch, originalSource);
	}
	return sourceText;
}

function insertObjectProperty(sourceText, objectNode, patch, originalSource) {
	if (!patch.key) {
		throw new Error("Insert into object requires 'key' property");
	}

	// Check if key already exists
	for (const prop of objectNode.properties) {
		const keyStr = extractString(prop.key, originalSource);
		if (keyStr === patch.key) {
			throw new Error(`Key "${patch.key}" already exists in object`);
		}
	}

	const newEntry = `"${patch.key}": ${patch.value}`;

	if (objectNode.properties.length === 0) {
		// Empty object
		const insertPos = objectNode.start + 1;
		return sourceText.slice(0, insertPos) + newEntry + sourceText.slice(insertPos);
	} else {
		// Insert after last property
		const lastProp = objectNode.properties[objectNode.properties.length - 1];
		const insertPos = lastProp.value.end;
		return sourceText.slice(0, insertPos) + ", " + newEntry + sourceText.slice(insertPos);
	}
}

function insertArrayElement(sourceText, arrayNode, patch, originalSource) {
	const position = patch.position !== undefined ? patch.position : arrayNode.elements.length;

	if (position < 0 || position > arrayNode.elements.length) {
		throw new Error(`Invalid position ${position} for array of length ${arrayNode.elements.length}`);
	}

	if (arrayNode.elements.length === 0) {
		// Empty array
		const insertPos = arrayNode.start + 1;
		return sourceText.slice(0, insertPos) + patch.value + sourceText.slice(insertPos);
	} else if (position === 0) {
		// Insert at the beginning
		const insertPos = arrayNode.elements[0].start;
		return sourceText.slice(0, insertPos) + patch.value + ", " + sourceText.slice(insertPos);
	} else if (position >= arrayNode.elements.length) {
		// Insert at the end
		const lastElement = arrayNode.elements[arrayNode.elements.length - 1];
		const insertPos = lastElement.end;
		return sourceText.slice(0, insertPos) + ", " + patch.value + sourceText.slice(insertPos);
	} else {
		// Insert in the middle
		const insertPos = arrayNode.elements[position].start;
		return sourceText.slice(0, insertPos) + patch.value + ", " + sourceText.slice(insertPos);
	}
}
