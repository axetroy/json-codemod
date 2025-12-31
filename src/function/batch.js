import { replace } from "./replace.js";
import { remove } from "./delete.js";
import { insert } from "./insert.js";
import { Tokenizer } from "../Tokenizer.js";
import { CSTBuilder } from "../CSTBuilder.js";

export function batch(sourceText, patches) {
	// Parse the source text once
	const tokenizer = new Tokenizer(sourceText);
	const tokens = tokenizer.tokenize();
	const builder = new CSTBuilder(tokens);
	const root = builder.build();

	// Categorize patches by operation type
	const replacePatches = [];
	const deletePatches = [];
	const insertPatches = [];

	for (const p of patches) {
		// Require explicit operation type - no implicit detection
		if (!p.operation) {
			throw new Error(
				`Operation type is required. Please specify operation: "replace", "delete", or "insert" for patch at path "${p.path}"`
			);
		}

		switch (p.operation) {
			case "replace":
				if (p.value === undefined) {
					throw new Error(`Replace operation requires 'value' property for patch at path "${p.path}"`);
				}
				replacePatches.push({ path: p.path, value: p.value });
				break;
			case "delete":
			case "remove":
				deletePatches.push({ path: p.path });
				break;
			case "insert":
				if (p.value === undefined) {
					throw new Error(`Insert operation requires 'value' property for patch at path "${p.path}"`);
				}
				insertPatches.push(p);
				break;
			default:
				throw new Error(
					`Invalid operation type "${p.operation}". Must be "replace", "delete", "remove", or "insert" for patch at path "${p.path}"`
				);
		}
	}

	// Apply patches in order: replace, insert, delete
	// This order ensures that replacements happen first, then inserts, then deletes
	let result = sourceText;

	// Apply replacements
	if (replacePatches.length > 0) {
		result = replace(result, replacePatches, root);
	}

	// Apply insertions
	if (insertPatches.length > 0) {
		// Need to re-parse if we did replacements
		const currentRoot = replacePatches.length > 0 ? null : root;
		result = insert(result, insertPatches, currentRoot);
	}

	// Apply deletions
	if (deletePatches.length > 0) {
		// Need to re-parse if we did replacements or insertions
		const currentRoot = replacePatches.length > 0 || insertPatches.length > 0 ? null : root;
		result = remove(result, deletePatches, currentRoot);
	}

	return result;
}
