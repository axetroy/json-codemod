import { replace } from "./function/replace.js";
import { remove } from "./function/delete.js";
import { insert } from "./function/insert.js";
import { batch } from "./function/batch.js";
import * as valueHelpers from "./value-helpers.js";

const jsoncst = {
	replace: replace,
	remove: remove,
	insert: insert,
	batch: batch,
	// Value formatting helpers for better DX
	formatValue: valueHelpers.formatValue,
	string: valueHelpers.string,
	number: valueHelpers.number,
	boolean: valueHelpers.boolean,
	nullValue: valueHelpers.nullValue,
	object: valueHelpers.object,
	array: valueHelpers.array,
};

export { replace, remove, insert, batch };
export * from "./value-helpers.js";

export default jsoncst;
