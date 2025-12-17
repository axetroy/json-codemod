import { Node } from "../CSTBuilder.js";

export interface ReplacePatch {
	/**
	 * A JSON path where the replacement should occur.
	 */
	path: string;
	/**
	 * The value to insert at the specified path.
	 */
	value: string;
}

/**
 * Replaces values in a JSON-like string at specified paths with new values.
 * @param sourceText - The original JSON content as a string.
 * @param patches - An array of replacement instructions.
 * @param root - Optional CST root node to avoid re-parsing.
 */
export declare function replace(sourceText: string, patches: Array<ReplacePatch>, root?: Node): string;
