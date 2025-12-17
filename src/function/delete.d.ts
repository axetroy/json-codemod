import { Node } from "../CSTBuilder.js";

export interface DeletePatch {
	/**
	 * A JSON path to delete.
	 */
	path: string;
}

/**
 * Deletes nodes from the JSON content based on the provided patches.
 * @param sourceText - The original JSON content as a string.
 * @param patches - An array of delete patches specifying the paths to remove.
 * @param root - Optional CST root node to avoid re-parsing.
 */
export declare function remove(sourceText: string, patches: Array<DeletePatch>, root?: Node): string;
