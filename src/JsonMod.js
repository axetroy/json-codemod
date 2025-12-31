import { Tokenizer } from "./Tokenizer.js";
import { CSTBuilder } from "./CSTBuilder.js";
import { resolvePath } from "./PathResolver.js";
import { parsePath, extractString } from "./helper.js";

/**
 * JsonMod - A chainable API for modifying JSON strings while preserving formatting
 * @class
 */
export class JsonMod {
	/**
	 * Creates a new JsonMod instance
	 * @param {string} sourceText - The JSON string to modify
	 */
	constructor(sourceText) {
		this.sourceText = sourceText;
		this.operations = [];
	}

	/**
	 * Replace a value at the specified path
	 * @param {string|string[]} path - The JSON path or array of path segments
	 * @param {string} value - The new value as a JSON string
	 * @returns {JsonMod} - Returns this for chaining
	 * @example
	 * jsonmod(source).replace("user.name", '"Bob"').apply()
	 * jsonmod(source).replace(["user", "name"], '"Bob"').apply()
	 */
	replace(path, value) {
		this.operations.push({
			type: "replace",
			path: Array.isArray(path) ? path : path,
			value,
		});
		return this;
	}

	/**
	 * Delete a property or array element at the specified path
	 * @param {string|string[]} path - The JSON path or array of path segments
	 * @returns {JsonMod} - Returns this for chaining
	 * @example
	 * jsonmod(source).delete("user.age").apply()
	 * jsonmod(source).remove(["user", "age"]).apply()
	 */
	delete(path) {
		this.operations.push({
			type: "delete",
			path: Array.isArray(path) ? path : path,
		});
		return this;
	}

	/**
	 * Alias for delete()
	 * @param {string|string[]} path - The JSON path or array of path segments
	 * @returns {JsonMod} - Returns this for chaining
	 */
	remove(path) {
		return this.delete(path);
	}

	/**
	 * Insert a new property into an object or element into an array
	 * @param {string|string[]} path - The JSON path pointing to the object/array
	 * @param {string|number} keyOrPosition - For objects: property name; For arrays: index
	 * @param {string} value - The value to insert as a JSON string
	 * @returns {JsonMod} - Returns this for chaining
	 * @example
	 * jsonmod(source).insert("user", "email", '"test@example.com"').apply()
	 * jsonmod(source).insert("items", 0, '"newItem"').apply()
	 */
	insert(path, keyOrPosition, value) {
		this.operations.push({
			type: "insert",
			path: Array.isArray(path) ? path : path,
			keyOrPosition,
			value,
		});
		return this;
	}

	/**
	 * Apply all queued operations and return the modified JSON string
	 * @returns {string} - The modified JSON string
	 */
	apply() {
		if (this.operations.length === 0) {
			return this.sourceText;
		}

		let result = this.sourceText;

		// Apply operations sequentially to avoid conflicts
		for (const op of this.operations) {
			switch (op.type) {
				case "replace":
					result = this._applySingleReplace(result, op);
					break;
				case "delete":
					result = this._applySingleDelete(result, op);
					break;
				case "insert":
					result = this._applySingleInsert(result, op);
					break;
			}
		}

		return result;
	}

	/**
	 * Internal method to apply a single replace operation
	 * @private
	 */
	_applySingleReplace(sourceText, op) {
		const tokenizer = new Tokenizer(sourceText);
		const tokens = tokenizer.tokenize();
		const builder = new CSTBuilder(tokens);
		const root = builder.build();

		const node = resolvePath(root, op.path, sourceText);
		if (!node) {
			return sourceText;
		}

		return sourceText.slice(0, node.start) + op.value + sourceText.slice(node.end);
	}

	/**
	 * Internal method to apply a single delete operation
	 * @private
	 */
	_applySingleDelete(sourceText, op) {
		const tokenizer = new Tokenizer(sourceText);
		const tokens = tokenizer.tokenize();
		const builder = new CSTBuilder(tokens);
		const root = builder.build();

		const pathParts = parsePath(op.path);
		if (pathParts.length === 0) {
			return sourceText;
		}

		const parentPath = pathParts.slice(0, -1);
		const lastKey = pathParts[pathParts.length - 1];
		const parentNode = parentPath.length > 0 ? resolvePath(root, parentPath, sourceText) : root;

		if (!parentNode) {
			return sourceText;
		}

		return this._deleteFromParent(sourceText, parentNode, lastKey, sourceText);
	}

	/**
	 * Internal method to apply a single insert operation
	 * @private
	 */
	_applySingleInsert(sourceText, op) {
		const tokenizer = new Tokenizer(sourceText);
		const tokens = tokenizer.tokenize();
		const builder = new CSTBuilder(tokens);
		const root = builder.build();

		const node = resolvePath(root, op.path, sourceText);
		if (!node) {
			return sourceText;
		}

		return this._insertIntoNode(sourceText, node, op, sourceText);
	}

	_getDeleteStart(parentNode, key, sourceText) {
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

	_deleteFromParent(sourceText, parentNode, key, originalSource) {
		if (parentNode.type === "Object") {
			return this._deleteObjectProperty(sourceText, parentNode, key, originalSource);
		} else if (parentNode.type === "Array") {
			return this._deleteArrayElement(sourceText, parentNode, key, originalSource);
		}
		return sourceText;
	}

	_deleteObjectProperty(sourceText, objectNode, key, originalSource) {
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
			let pos = deleteEnd;
			while (
				pos < sourceText.length &&
				(sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")
			) {
				pos++;
			}
			if (sourceText[pos] === ",") {
				deleteEnd = pos + 1;
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
			let pos = deleteStart - 1;
			while (pos >= 0 && (sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")) {
				pos--;
			}
			if (sourceText[pos] === ",") {
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

	_deleteArrayElement(sourceText, arrayNode, index, originalSource) {
		if (typeof index !== "number" || index < 0 || index >= arrayNode.elements.length) {
			return sourceText;
		}

		const element = arrayNode.elements[index];
		let deleteStart = element.start;
		let deleteEnd = element.end;

		// Handle comma and whitespace
		if (index < arrayNode.elements.length - 1) {
			let pos = deleteEnd;
			while (
				pos < sourceText.length &&
				(sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")
			) {
				pos++;
			}
			if (sourceText[pos] === ",") {
				deleteEnd = pos + 1;
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
			let pos = deleteStart - 1;
			while (pos >= 0 && (sourceText[pos] === " " || sourceText[pos] === "\t" || sourceText[pos] === "\n" || sourceText[pos] === "\r")) {
				pos--;
			}
			if (sourceText[pos] === ",") {
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

	_insertIntoNode(sourceText, node, patch, originalSource) {
		if (node.type === "Object") {
			return this._insertObjectProperty(sourceText, node, patch, originalSource);
		} else if (node.type === "Array") {
			return this._insertArrayElement(sourceText, node, patch, originalSource);
		}
		return sourceText;
	}

	_insertObjectProperty(sourceText, objectNode, patch, originalSource) {
		const key = patch.keyOrPosition;
		if (typeof key !== "string") {
			throw new Error("Insert into object requires a string key");
		}

		// Check if key already exists
		for (const prop of objectNode.properties) {
			const keyStr = extractString(prop.key, originalSource);
			if (keyStr === key) {
				throw new Error(`Key "${key}" already exists in object`);
			}
		}

		const newEntry = `"${key}": ${patch.value}`;

		if (objectNode.properties.length === 0) {
			const insertPos = objectNode.start + 1;
			return sourceText.slice(0, insertPos) + newEntry + sourceText.slice(insertPos);
		} else {
			const lastProp = objectNode.properties[objectNode.properties.length - 1];
			const insertPos = lastProp.value.end;
			return sourceText.slice(0, insertPos) + ", " + newEntry + sourceText.slice(insertPos);
		}
	}

	_insertArrayElement(sourceText, arrayNode, patch, originalSource) {
		const position = typeof patch.keyOrPosition === "number" ? patch.keyOrPosition : arrayNode.elements.length;

		if (position < 0 || position > arrayNode.elements.length) {
			throw new Error(`Invalid position ${position} for array of length ${arrayNode.elements.length}`);
		}

		if (arrayNode.elements.length === 0) {
			const insertPos = arrayNode.start + 1;
			return sourceText.slice(0, insertPos) + patch.value + sourceText.slice(insertPos);
		} else if (position === 0) {
			const insertPos = arrayNode.elements[0].start;
			return sourceText.slice(0, insertPos) + patch.value + ", " + sourceText.slice(insertPos);
		} else if (position >= arrayNode.elements.length) {
			const lastElement = arrayNode.elements[arrayNode.elements.length - 1];
			const insertPos = lastElement.end;
			return sourceText.slice(0, insertPos) + ", " + patch.value + sourceText.slice(insertPos);
		} else {
			const insertPos = arrayNode.elements[position].start;
			return sourceText.slice(0, insertPos) + patch.value + ", " + sourceText.slice(insertPos);
		}
	}
}

/**
 * Factory function to create a new JsonMod instance
 * @param {string} sourceText - The JSON string to modify
 * @returns {JsonMod} - A new JsonMod instance
 * @example
 * jsonmod(source).replace("a", "10").delete("b").apply()
 */
export function jsonmod(sourceText) {
	return new JsonMod(sourceText);
}
