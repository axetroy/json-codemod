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
 * All patches MUST have an explicit operation field.
 * 
 * BREAKING CHANGE: The operation field is now required.
 * Implicit operation detection has been removed.
 */
export type BatchPatch = ExplicitReplacePatch | ExplicitDeletePatch | ExplicitInsertPatch;

/**
 * Applies a batch of patches to the source text.
 * @param sourceText - The original source text.
 * @param patches - An array of patches to apply. Each patch MUST include an explicit operation field.
 * @returns The modified source text after applying all patches.
 * @throws {Error} If any patch is missing the operation field or has an invalid operation type.
 * @example
 * // All patches require explicit operation type
 * batch(source, [
 *   { operation: "replace", path: "a", value: "1" },
 *   { operation: "delete", path: "b" },
 *   { operation: "insert", path: "arr", position: 0, value: "2" }
 * ]);
 */
export declare function batch(sourceText: string, patches: Array<BatchPatch>): string;
