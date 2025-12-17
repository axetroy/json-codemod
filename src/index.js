import { replace } from "./function/replace.js";
import { remove } from "./function/delete.js";
import { insert } from "./function/insert.js";

const jsoncst = {
	replace: replace,
	remove: remove,
	insert: insert,
};

function patch(sourceText, patches) {
	// TODO: 实现补丁功能
}

export { replace, remove, insert };
export default jsoncst;
