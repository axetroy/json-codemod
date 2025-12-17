function unescapeString(str) {
	return str.replace(/\\(.)/g, (_, ch) => {
		switch (ch) {
			case '"':
				return '"';
			case "\\":
				return "\\";
			case "/":
				return "/";
			case "b":
				return "\b";
			case "f":
				return "\f";
			case "n":
				return "\n";
			case "r":
				return "\r";
			case "t":
				return "\t";
			default:
				return ch; // \uXXXX 可后续增强
		}
	});
}

export function extractString(stringNode, sourceText) {
	// sourceText 是完整 JSON 文本
	// stringNode.start / end 覆盖包含引号
	const raw = sourceText.slice(stringNode.start + 1, stringNode.end - 1);
	return unescapeString(raw);
}

/**
 *
 * @param {string} path
 * @returns
 */
export function parsePath(path) {
	if (path.startsWith("/")) {
		return parseJSONPointer(path);
	}
	return parseDotPath(path);
}

/**
 *
 * @param {string} path
 * @returns
 */
function parseDotPath(path) {
	const result = [];
	let i = 0;

	while (i < path.length) {
		const ch = path[i];

		// skip dot
		if (ch === ".") {
			i++;
			continue;
		}

		// array index: [123]
		if (ch === "[") {
			i++;
			let num = "";
			while (i < path.length && path[i] !== "]") {
				num += path[i++];
			}
			i++; // skip ]
			result.push(Number(num));
			continue;
		}

		// identifier
		let name = "";
		while (i < path.length && /[a-zA-Z0-9_$]/.test(path[i])) {
			name += path[i++];
		}
		result.push(name);
	}

	return result;
}

/**
 *
 * @param {string} pointer
 * @returns
 */
function parseJSONPointer(pointer) {
	if (pointer === "") return [];

	if (pointer[0] !== "/") {
		throw new Error("Invalid JSON Pointer");
	}

	return pointer
		.slice(1)
		.split("/")
		.map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
		.map((seg) => {
			return /^\d+$/.test(seg) ? Number(seg) : seg;
		});
}
