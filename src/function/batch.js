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
		// Support explicit operation type for clarity
		if (p.operation) {
			switch (p.operation) {
				case "replace":
					replacePatches.push({ path: p.path, value: p.value });
					break;
				case "delete":
				case "remove":
					deletePatches.push({ path: p.path });
					break;
				case "insert":
					insertPatches.push(p);
					break;
				default:
					// Invalid operation - skip it
					continue;
			}
		} else {
			// Determine patch type based on properties (backward compatibility)
			if (p.value !== undefined && p.key === undefined && p.position === undefined) {
				// Has value but no key/position -> replace operation
				replacePatches.push({ path: p.path, value: p.value });
			} else if (p.value === undefined && p.key === undefined && p.position === undefined) {
				// No value, key, or position -> delete operation
				deletePatches.push({ path: p.path });
			} else if ((p.key !== undefined || p.position !== undefined) && p.value !== undefined) {
				// Has key or position with value -> insert operation
				insertPatches.push(p);
			} else {
				// Invalid patch - skip it
				continue;
			}
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
