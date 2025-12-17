import { Tokenizer } from "../Tokenizer.js";
import { CSTBuilder } from "../CSTBuilder.js";
import { resolvePath } from "../PathResolver.js";

/**
 * Replaces values in a JSON string while preserving formatting, comments, and whitespace.
 * 
 * @param {string} sourceText - The original JSON string to modify
 * @param {Array<{path: string, value: string}>} patches - Array of replacement operations to apply
 * @param {string} patches[].path - JSON path where the replacement should occur (supports dot notation like "a.b.c" or JSON Pointer like "/a/b/c")
 * @param {string} patches[].value - The new value to insert at the specified path (must be a valid JSON value as a string)
 * @returns {string} The modified JSON string with replacements applied
 * @throws {Error} If multiple patches have conflicting (overlapping) paths
 * 
 * @example
 * // Replace a single value
 * replace('{"age": 30}', [{ path: "age", value: "31" }]);
 * // Returns: '{"age": 31}'
 * 
 * @example
 * // Replace nested values
 * replace('{"user": {"name": "Alice"}}', [{ path: "user.name", value: '"Bob"' }]);
 * // Returns: '{"user": {"name": "Bob"}}'
 * 
 * @example
 * // Replace array elements
 * replace('{"items": [1, 2, 3]}', [{ path: "items[1]", value: "99" }]);
 * // Returns: '{"items": [1, 99, 3]}'
 */
export function replace(sourceText, patches) {
	const tokenizer = new Tokenizer(sourceText);
	const tokens = tokenizer.tokenize();

	const builder = new CSTBuilder(tokens);
	const root = builder.build();

	// 倒叙替换
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

	// 确保不会冲突
	reverseNodes.reduce((lastEnd, { node }) => {
		if (node.end > lastEnd) {
			throw new Error(`Patch conflict at path: ${node.path}`);
		}

		return node.start;
	}, Infinity);

	let result = sourceText;

	for (const { node, patch } of reverseNodes) {
		result = result.slice(0, node.start) + patch.value + result.slice(node.end);
	}

	return result;
}
