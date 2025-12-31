import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { replace, remove, insert, batch } from "./index.js";

// ===== REPLACE OPERATION TESTS =====
describe("Replace Operation Tests", () => {
	test("replace simple value", () => {
		const source = '{"a":1,"b":true}';

		const replaced = replace(source, [{ path: "a", value: "42" }]);

		assert.equal(replaced, '{"a":42,"b":true}');
	});

	test("replace array element", () => {
		const source = '{"arr":[1,2,3]}';

		const replaced = replace(source, [{ path: "arr[1]", value: "99" }]);

		assert.equal(replaced, '{"arr":[1,99,3]}');
	});

	test("replace nested object value", () => {
		const source = '{"a":{"b":{"c":1}}}';

		const replaced = replace(source, [{ path: "a.b.c", value: "123" }]);

		assert.equal(replaced, '{"a":{"b":{"c":123}}}');
	});

	test("replace multiple paths", () => {
		const source = '{"x":1,"y":2,"arr":[3,4]}';

		const replaced = replace(source, [
			{ path: "x", value: "10" },
			{ path: "arr[0]", value: "30" },
		]);

		assert.equal(replaced, '{"x":10,"y":2,"arr":[30,4]}');
	});

	test("replace using JSON pointer", () => {
		const source = '{"a":{"b":[1,2,3]}}';

		const replaced = replace(source, [{ path: "/a/b/2", value: "99" }]);

		assert.equal(replaced, '{"a":{"b":[1,2,99]}}');
	});

	test("replace using escaped JSON pointer", () => {
		const source = '{"a/b":{"c~d":5}}';

		const replaced = replace(source, [{ path: "/a~1b/c~0d", value: "42" }]);

		assert.equal(replaced, '{"a/b":{"c~d":42}}');
	});

	test("replace with string value", () => {
		const source = '{"greeting":"hello"}';

		const replaced = replace(source, [{ path: "greeting", value: '"hi"' }]);

		assert.equal(replaced, '{"greeting":"hi"}');
	});

	test("replace boolean value", () => {
		const source = '{"flag":false}';

		const replaced = replace(source, [{ path: "flag", value: "true" }]);

		assert.equal(replaced, '{"flag":true}');
	});

	test("replace null value", () => {
		const source = '{"data":null}';

		const replaced = replace(source, [{ path: "data", value: '"not null"' }]);

		assert.equal(replaced, '{"data":"not null"}');
	});

	test("replace entire object", () => {
		const source = '{"obj":{"a":1,"b":2}}';

		const replaced = replace(source, [{ path: "obj", value: '{"x":10,"y":20}' }]);

		assert.equal(replaced, '{"obj":{"x":10,"y":20}}');
	});

	test("replace entire array", () => {
		const source = '{"arr":[1,2,3]}';

		const replaced = replace(source, [{ path: "arr", value: "[10,20,30]" }]);

		assert.equal(replaced, '{"arr":[10,20,30]}');
	});

	test("replace with whitespace preservation", () => {
		const source = '{  "key"  :  1  }';

		const replaced = replace(source, [{ path: "key", value: "42" }]);

		assert.equal(replaced, '{  "key"  :  42  }');
	});

	test("replace with special characters in strings", () => {
		const source = '{"text":"Line1\\nLine2"}';

		const replaced = replace(source, [{ path: "text", value: '"NewLine1\\nNewLine2"' }]);

		assert.equal(replaced, '{"text":"NewLine1\\nNewLine2"}');
	});

	test("replace numeric keys in object", () => {
		const source = '{"1":"one","2":"two"}';

		const replaced = replace(source, [{ path: "2", value: '"TWO"' }]);

		assert.equal(replaced, '{"1":"one","2":"TWO"}');
	});
	test("replace with empty string", () => {
		const source = '{"message":"Hello, World!"}';

		const replaced = replace(source, [{ path: "message", value: '""' }]);

		assert.equal(replaced, '{"message":""}');
	});

	test("replace array with different length", () => {
		const source = '{"numbers":[1,2,3,4,5]}';

		const replaced = replace(source, [{ path: "numbers", value: "[10,20]" }]);

		assert.equal(replaced, '{"numbers":[10,20]}');
	});

	test("replace and keep formatting", () => {
		const source = `{
	"name": "Alice",
	"age": 		30,
	"isStudent": false
}`;

		const replaced = replace(source, [{ path: "age", value: "31" }]);

		const expected = `{
	"name": "Alice",
	"age": 		31,
	"isStudent": false
}`;

		assert.equal(replaced, expected);
	});

	test("replace non-existing path", () => {
		const source = '{"a":1,"b":2}';

		const replaced = replace(source, [{ path: "c", value: "3" }]);

		// Should remain unchanged
		assert.equal(replaced, '{"a":1,"b":2}');
	});

	test("replace with multiple patches", () => {
		const source = '{"a":1,"b":{"c":2,"d":[3,4,5]}}';

		const replaced = replace(source, [
			{
				path: "b.c",
				value: "20",
			},
			{ path: "b.d[1]", value: "40" },
		]);

		assert.equal(replaced, '{"a":1,"b":{"c":20,"d":[3,40,5]}}');
	});

	test("replace with comments preserved", () => {
		const source = `{
	// This is a comment
	"key": "value" /* inline comment */
}`;

		const replaced = replace(source, [{ path: "key", value: '"newValue"' }]);

		const expected = `{
	// This is a comment
	"key": "newValue" /* inline comment */
}`;

		assert.equal(replaced, expected);
	});
});

// ===== DELETE OPERATION TESTS =====
describe("Delete Operation Tests", () => {
	test("remove simple property from object", () => {
		const source = '{"a":1,"b":2,"c":3}';

		const result = remove(source, [{ path: "b" }]);

		assert.equal(result, '{"a":1,"c":3}');
	});

	test("remove first property from object", () => {
		const source = '{"a":1,"b":2,"c":3}';

		const result = remove(source, [{ path: "a" }]);

		assert.equal(result, '{"b":2,"c":3}');
	});

	test("remove last property from object", () => {
		const source = '{"a":1,"b":2,"c":3}';

		const result = remove(source, [{ path: "c" }]);

		assert.equal(result, '{"a":1,"b":2}');
	});

	test("remove array element", () => {
		const source = '{"arr":[1,2,3,4]}';

		const result = remove(source, [{ path: "arr[1]" }]);

		assert.equal(result, '{"arr":[1,3,4]}');
	});

	test("remove first array element", () => {
		const source = '{"arr":[1,2,3]}';

		const result = remove(source, [{ path: "arr[0]" }]);

		assert.equal(result, '{"arr":[2,3]}');
	});

	test("remove last array element", () => {
		const source = '{"arr":[1,2,3]}';

		const result = remove(source, [{ path: "arr[2]" }]);

		assert.equal(result, '{"arr":[1,2]}');
	});

	test("remove nested object property", () => {
		const source = '{"a":{"b":1,"c":2},"d":3}';

		const result = remove(source, [{ path: "a.b" }]);

		assert.equal(result, '{"a":{"c":2},"d":3}');
	});

	test("remove with JSON pointer", () => {
		const source = '{"a":{"b":[1,2,3]}}';

		const result = remove(source, [{ path: "/a/b/1" }]);

		assert.equal(result, '{"a":{"b":[1,3]}}');
	});

	test("remove multiple properties", () => {
		const source = '{"a":1,"b":2,"c":3,"d":4}';

		const result = remove(source, [{ path: "b" }, { path: "d" }]);

		assert.equal(result, '{"a":1,"c":3}');
	});

	test("remove with whitespace preservation", () => {
		const source = '{  "a"  :  1  ,  "b"  :  2  }';

		const result = remove(source, [{ path: "b" }]);

		assert.equal(result, '{  "a"  :  1  }');
	});

	test("remove non-existing property", () => {
		const source = '{"a":1,"b":2}';

		const result = remove(source, [{ path: "c" }]);

		assert.equal(result, '{"a":1,"b":2}');
	});
});

// ===== INSERT OPERATION TESTS =====
describe("Insert Operation Tests", () => {
	test("insert property into object", () => {
		const source = '{"a":1,"b":2}';

		const result = insert(source, [{ path: "", key: "c", value: "3" }]);

		assert.equal(result, '{"a":1,"b":2, "c": 3}');
	});

	test("insert into empty object", () => {
		const source = "{}";

		const result = insert(source, [{ path: "", key: "a", value: "1" }]);

		assert.equal(result, '{"a": 1}');
	});

	test("insert element at start of array", () => {
		const source = '{"arr":[2,3,4]}';

		const result = insert(source, [{ path: "arr", position: 0, value: "1" }]);

		assert.equal(result, '{"arr":[1, 2,3,4]}');
	});

	test("insert element at end of array", () => {
		const source = '{"arr":[1,2,3]}';

		const result = insert(source, [{ path: "arr", position: 3, value: "4" }]);

		assert.equal(result, '{"arr":[1,2,3, 4]}');
	});

	test("insert element in middle of array", () => {
		const source = '{"arr":[1,3,4]}';

		const result = insert(source, [{ path: "arr", position: 1, value: "2" }]);

		assert.equal(result, '{"arr":[1,2, 3,4]}');
	});

	test("insert into empty array", () => {
		const source = '{"arr":[]}';

		const result = insert(source, [{ path: "arr", position: 0, value: "1" }]);

		assert.equal(result, '{"arr":[1]}');
	});

	test("insert without position appends to array", () => {
		const source = '{"arr":[1,2,3]}';

		const result = insert(source, [{ path: "arr", value: "4" }]);

		assert.equal(result, '{"arr":[1,2,3, 4]}');
	});

	test("insert nested object property", () => {
		const source = '{"a":{"b":1}}';

		const result = insert(source, [{ path: "a", key: "c", value: "2" }]);

		assert.equal(result, '{"a":{"b":1, "c": 2}}');
	});

	test("insert with JSON pointer", () => {
		const source = '{"a":{"arr":[1,2]}}';

		const result = insert(source, [{ path: "/a/arr", position: 1, value: "99" }]);

		assert.equal(result, '{"a":{"arr":[1,99, 2]}}');
	});
});

// ===== BATCH OPERATION TESTS =====
describe("Batch Operation Tests", () => {
	test("batch with mixed operations", () => {
		const source = '{"a": 1, "b": 2, "c": [1, 2, 3]}';

		const result = batch(source, [
			{ operation: "replace", path: "a", value: "10" },
			{ operation: "delete", path: "b" },
			{ operation: "insert", path: "c", position: 1, value: "99" },
		]);

		assert.equal(result, '{"a": 10, "c": [1, 99, 2, 3]}');
	});

	test("batch with only replacements", () => {
		const source = '{"x": 1, "y": 2}';

		const result = batch(source, [
			{ operation: "replace", path: "x", value: "100" },
			{ operation: "replace", path: "y", value: "200" },
		]);

		assert.equal(result, '{"x": 100, "y": 200}');
	});

	test("batch with only deletions", () => {
		const source = '{"a": 1, "b": 2, "c": 3}';

		const result = batch(source, [{ operation: "delete", path: "b" }]);

		assert.equal(result, '{"a": 1, "c": 3}');
	});

	test("batch with only insertions", () => {
		const source = '{"items": [1, 3]}';

		const result = batch(source, [{ operation: "insert", path: "items", position: 1, value: "2" }]);

		assert.equal(result, '{"items": [1, 2, 3]}');
	});

	test("batch with object operations", () => {
		const source = '{"user": {"name": "Alice", "age": 30}}';

		const result = batch(source, [
			{ operation: "replace", path: "user.name", value: '"Bob"' },
			{ operation: "delete", path: "user.age" },
			{ operation: "insert", path: "user", key: "email", value: '"bob@example.com"' },
		]);

		assert.equal(result, '{"user": {"name": "Bob", "email": "bob@example.com"}}');
	});

	test("batch with nested operations", () => {
		const source = '{"data": {"items": [1, 2, 3], "count": 3}}';

		const result = batch(source, [
			{ operation: "replace", path: "data.count", value: "4" },
			{ operation: "insert", path: "data.items", position: 3, value: "4" },
		]);

		assert.equal(result, '{"data": {"items": [1, 2, 3, 4], "count": 4}}');
	});

	test("batch with empty patches array", () => {
		const source = '{"a": 1}';

		const result = batch(source, []);

		assert.equal(result, '{"a": 1}');
	});

	test("batch preserves formatting", () => {
		const source = `{
  "name": "Alice",
  "age": 30,
  "items": [1, 2]
}`;

		const result = batch(source, [
			{ operation: "replace", path: "age", value: "31" },
			{ operation: "insert", path: "items", position: 2, value: "3" },
		]);

		const expected = `{
  "name": "Alice",
  "age": 31,
  "items": [1, 2, 3]
}`;

		assert.equal(result, expected);
	});

	test("batch with comments preserved", () => {
		const source = `{
  // User info
  "name": "Alice",
  "age": 30
}`;

		const result = batch(source, [
			{ operation: "replace", path: "age", value: "31" },
			{ operation: "insert", path: "", key: "email", value: '"alice@example.com"' },
		]);

		assert(result.includes("// User info"));
		assert(result.includes('"age": 31'));
		assert(result.includes('"email": "alice@example.com"'));
	});

	test("batch with explicit operation types", () => {
		const source = '{"a": 1, "b": 2, "items": [1, 2]}';

		const result = batch(source, [
			{ operation: "replace", path: "a", value: "10" },
			{ operation: "delete", path: "b" },
			{ operation: "insert", path: "items", position: 2, value: "3" },
		]);

		assert.equal(result, '{"a": 10, "items": [1, 2, 3]}');
	});

	test("batch with explicit operation 'remove' alias", () => {
		const source = '{"a": 1, "b": 2}';

		const result = batch(source, [{ operation: "remove", path: "b" }]);

		assert.equal(result, '{"a": 1}');
	});

	test("batch requires explicit operation type", () => {
		const source = '{"x": 1, "y": 2}';

		// Should throw error for missing operation field
		assert.throws(() => {
			batch(source, [{ path: "x", value: "10" }]);
		}, /Operation type is required/);
	});

	test("batch throws error for invalid operation type", () => {
		const source = '{"x": 1}';

		// Should throw error for invalid operation
		assert.throws(() => {
			batch(source, [{ operation: "update", path: "x", value: "10" }]);
		}, /Invalid operation type/);
	});

	test("batch throws error for replace without value", () => {
		const source = '{"x": 1}';

		// Should throw error for replace without value
		assert.throws(() => {
			batch(source, [{ operation: "replace", path: "x" }]);
		}, /Replace operation requires 'value' property/);
	});

	test("batch throws error for insert without value", () => {
		const source = '{"items": [1, 2]}';

		// Should throw error for insert without value
		assert.throws(() => {
			batch(source, [{ operation: "insert", path: "items", position: 0 }]);
		}, /Insert operation requires 'value' property/);
	});
});

// ===== VALUE HELPERS TESTS =====
import * as valueHelpers from "./value-helpers.js";

describe("Value Helpers Tests", () => {
	test("formatValue with number", () => {
		assert.equal(valueHelpers.formatValue(42), "42");
	});

	test("formatValue with string", () => {
		assert.equal(valueHelpers.formatValue("hello"), '"hello"');
	});

	test("formatValue with boolean", () => {
		assert.equal(valueHelpers.formatValue(true), "true");
		assert.equal(valueHelpers.formatValue(false), "false");
	});

	test("formatValue with null", () => {
		assert.equal(valueHelpers.formatValue(null), "null");
	});

	test("formatValue with object", () => {
		assert.equal(valueHelpers.formatValue({ a: 1, b: 2 }), '{"a":1,"b":2}');
	});

	test("formatValue with array", () => {
		assert.equal(valueHelpers.formatValue([1, 2, 3]), "[1,2,3]");
	});

	test("string helper", () => {
		assert.equal(valueHelpers.string("hello"), '"hello"');
	});

	test("number helper", () => {
		assert.equal(valueHelpers.number(42), "42");
		assert.equal(valueHelpers.number(3.14), "3.14");
	});

	test("boolean helper", () => {
		assert.equal(valueHelpers.boolean(true), "true");
		assert.equal(valueHelpers.boolean(false), "false");
	});

	test("nullValue helper", () => {
		assert.equal(valueHelpers.nullValue(), "null");
	});

	test("object helper", () => {
		assert.equal(valueHelpers.object({ key: "value" }), '{"key":"value"}');
	});

	test("array helper", () => {
		assert.equal(valueHelpers.array([1, 2, 3]), "[1,2,3]");
	});

	test("using value helpers with replace", () => {
		const source = '{"name": "Alice", "age": 30, "active": false}';

		const result = replace(source, [
			{ path: "name", value: valueHelpers.formatValue("Bob") },
			{ path: "age", value: valueHelpers.formatValue(31) },
			{ path: "active", value: valueHelpers.formatValue(true) },
		]);

		assert.equal(result, '{"name": "Bob", "age": 31, "active": true}');
	});

	test("using value helpers with insert", () => {
		const source = '{"user": {}}';

		// Need to do separate calls for multiple inserts to ensure proper order
		let result = insert(source, [
			{ path: "user", key: "email", value: valueHelpers.formatValue("test@example.com") },
		]);
		result = insert(result, [{ path: "user", key: "verified", value: valueHelpers.formatValue(true) }]);

		assert.equal(result, '{"user": {"email": "test@example.com", "verified": true}}');
	});

	test("using value helpers with batch", () => {
		const source = '{"count": 0, "items": []}';

		const result = batch(source, [
			{ operation: "replace", path: "count", value: valueHelpers.formatValue(5) },
			{ operation: "insert", path: "items", position: 0, value: valueHelpers.formatValue("item1") },
		]);

		assert.equal(result, '{"count": 5, "items": ["item1"]}');
	});
});
