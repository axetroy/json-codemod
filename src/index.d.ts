import { replace, ReplacePatch } from "./function/replace.js";
import { remove, DeletePatch } from "./function/delete.js";
import { insert, InsertPatch } from "./function/insert.js";
import { batch, BatchPatch, ExplicitReplacePatch, ExplicitDeletePatch, ExplicitInsertPatch } from "./function/batch.js";
import * as valueHelpers from "./value-helpers.js";

export {
	ReplacePatch,
	DeletePatch,
	InsertPatch,
	BatchPatch,
	ExplicitReplacePatch,
	ExplicitDeletePatch,
	ExplicitInsertPatch,
	replace,
	remove,
	insert,
	batch,
};

// Re-export value helpers
export * from "./value-helpers.js";

interface JSONCTS {
	replace: typeof replace;
	remove: typeof remove;
	insert: typeof insert;
	batch: typeof batch;
	// Value formatting helpers
	formatValue: typeof valueHelpers.formatValue;
	string: typeof valueHelpers.string;
	number: typeof valueHelpers.number;
	boolean: typeof valueHelpers.boolean;
	nullValue: typeof valueHelpers.nullValue;
	object: typeof valueHelpers.object;
	array: typeof valueHelpers.array;
}

declare const jsoncts: JSONCTS;

export default jsoncts;
