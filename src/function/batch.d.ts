import { ReplacePatch } from "./replace.js";
import { DeletePatch } from "./delete.js";
import { InsertPatch } from "./insert.js";

/**
 * Patch with explicit operation type for replace operation
 */
export interface ExplicitReplacePatch {
	operation: "replace";
	path: string;
	value: string;
}

/**
 * Patch with explicit operation type for delete/remove operation
 */
export interface ExplicitDeletePatch {
	operation: "delete" | "remove";
	path: string;
}

/**
 * Patch with explicit operation type for insert operation
 */
export interface ExplicitInsertPatch {
	operation: "insert";
	path: string;
	value: string;
	key?: string;
	position?: number;
}

/**
 * Union type for all batch patch types.
 * Supports both implicit (inferred from properties) and explicit (with operation field) patch types.
 */
export type BatchPatch =
	| ReplacePatch
	| DeletePatch
	| InsertPatch
	| ExplicitReplacePatch
	| ExplicitDeletePatch
	| ExplicitInsertPatch;

/**
 * Applies a batch of patches to the source text.
 * @param sourceText - The original source text.
 * @param patches - An array of patches to apply. Can use either implicit or explicit operation types.
 * @returns The modified source text after applying all patches.
 * @example
 * // Implicit operation detection (backward compatible)
 * batch(source, [
 *   { path: "a", value: "1" },  // replace
 *   { path: "b" },  // delete
 *   { path: "arr", position: 0, value: "2" }  // insert
 * ]);
 * 
 * // Explicit operation type (recommended for clarity)
 * batch(source, [
 *   { operation: "replace", path: "a", value: "1" },
 *   { operation: "delete", path: "b" },
 *   { operation: "insert", path: "arr", position: 0, value: "2" }
 * ]);
 */
export declare function batch(sourceText: string, patches: Array<BatchPatch>): string;
