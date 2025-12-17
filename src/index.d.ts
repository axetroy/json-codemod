import { replace, ReplacePatch } from "./function/replace.js";
import { remove, DeletePatch } from "./function/delete.js";
import { insert, InsertPatch } from "./function/insert.js";

export { ReplacePatch, DeletePatch, InsertPatch };
interface JSONCTS {
	replace: typeof replace;
	remove: typeof remove;
	insert: typeof insert;
}

declare const jsoncts: JSONCTS;

export default jsoncts;
