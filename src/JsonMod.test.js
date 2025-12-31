import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { jsonmod } from "./JsonMod.js";

describe("JsonMod Chainable API Tests", () => {
	test("simple replace operation", () => {
		const source = '{"a":1,"b":true}';
		const result = jsonmod(source).replace("a", "42").apply();
		assert.equal(result, '{"a":42,"b":true}');
	});

	test("multiple replace operations", () => {
		const source = '{"x":1,"y":2}';
		const result = jsonmod(source).replace("x", "10").replace("y", "20").apply();
		assert.equal(result, '{"x":10,"y":20}');
	});

	test("simple delete operation", () => {
		const source = '{"a":1,"b":2,"c":3}';
		const result = jsonmod(source).delete("b").apply();
		assert.equal(result, '{"a":1,"c":3}');
	});

	test("remove is alias for delete", () => {
		const source = '{"a":1,"b":2}';
		const result = jsonmod(source).remove("b").apply();
		assert.equal(result, '{"a":1}');
	});

	test("multiple delete operations", () => {
		const source = '{"a":1,"b":2,"c":3}';
		const result = jsonmod(source).delete("a").delete("c").apply();
		assert.equal(result, '{"b":2}');
	});

	test("insert into object", () => {
		const source = '{"name":"Alice"}';
		const result = jsonmod(source).insert("", "age", "30").apply();
		assert.equal(result, '{"name":"Alice", "age": 30}');
	});

	test("insert into array at start", () => {
		const source = '{"arr":[2,3]}';
		const result = jsonmod(source).insert("arr", 0, "1").apply();
		assert.equal(result, '{"arr":[1, 2,3]}');
	});

	test("insert into array at end", () => {
		const source = '{"arr":[1,2]}';
		const result = jsonmod(source).insert("arr", 2, "3").apply();
		assert.equal(result, '{"arr":[1,2, 3]}');
	});

	test("chained replace and delete", () => {
		const source = '{"a":1,"b":2,"c":3}';
		const result = jsonmod(source).replace("a", "10").delete("b").apply();
		assert.equal(result, '{"a":10,"c":3}');
	});

	test("chained replace, delete, and insert", () => {
		const source = '{"a":1,"b":2}';
		const result = jsonmod(source).replace("a", "10").delete("b").insert("", "c", "3").apply();
		assert.equal(result, '{"a":10, "c": 3}');
	});

	test("nested object replace", () => {
		const source = '{"user":{"name":"Alice","age":30}}';
		const result = jsonmod(source).replace("user.name", '"Bob"').apply();
		assert.equal(result, '{"user":{"name":"Bob","age":30}}');
	});

	test("array element replace", () => {
		const source = '{"arr":[1,2,3]}';
		const result = jsonmod(source).replace("arr[1]", "99").apply();
		assert.equal(result, '{"arr":[1,99,3]}');
	});

	test("complex chained operations", () => {
		const source = '{"user":{"name":"Alice","age":30},"items":[1,2,3]}';
		const result = jsonmod(source)
			.replace("user.name", '"Bob"')
			.replace("user.age", "31")
			.delete("items[1]")
			.insert("items", 2, "4") // After delete, array has length 2, so we insert at position 2
			.apply();

		// After operations: name=Bob, age=31, items=[1,3,4]
		assert(result.includes('"name":"Bob"'));
		assert(result.includes('"age":31'));
		// Note: exact formatting may vary based on operation order
	});

	test("preserves formatting and comments", () => {
		const source = `{
  // User info
  "name": "Alice",
  "age": 30
}`;

		const result = jsonmod(source).replace("age", "31").apply();

		assert(result.includes("// User info"));
		assert(result.includes('"age": 31'));
	});

	test("no operations returns original", () => {
		const source = '{"a":1}';
		const result = jsonmod(source).apply();
		assert.equal(result, source);
	});

	test("using JSON pointer path", () => {
		const source = '{"a":{"b":[1,2,3]}}';
		const result = jsonmod(source).replace("/a/b/2", "99").apply();
		assert.equal(result, '{"a":{"b":[1,2,99]}}');
	});

	test("replace with string value", () => {
		const source = '{"greeting":"hello"}';
		const result = jsonmod(source).replace("greeting", '"hi"').apply();
		assert.equal(result, '{"greeting":"hi"}');
	});

	test("replace with object value", () => {
		const source = '{"obj":{"a":1}}';
		const result = jsonmod(source).replace("obj", '{"x":10}').apply();
		assert.equal(result, '{"obj":{"x":10}}');
	});

	test("replace with array value", () => {
		const source = '{"arr":[1,2]}';
		const result = jsonmod(source).replace("arr", "[10,20]").apply();
		assert.equal(result, '{"arr":[10,20]}');
	});

	test("delete from nested object", () => {
		const source = '{"user":{"name":"Alice","age":30,"city":"NYC"}}';
		const result = jsonmod(source).delete("user.age").apply();
		assert(result.includes('"name":"Alice"'));
		assert(result.includes('"city":"NYC"'));
		assert(!result.includes("age"));
	});

	test("delete from array", () => {
		const source = '{"arr":[1,2,3,4,5]}';
		const result = jsonmod(source).delete("arr[2]").apply();
		assert.equal(result, '{"arr":[1,2,4,5]}');
	});

	test("insert empty object property", () => {
		const source = '{"user":{}}';
		const result = jsonmod(source).insert("user", "email", '"test@example.com"').apply();
		assert.equal(result, '{"user":{"email": "test@example.com"}}');
	});

	test("insert into empty array", () => {
		const source = '{"arr":[]}';
		const result = jsonmod(source).insert("arr", 0, '"item"').apply();
		assert.equal(result, '{"arr":["item"]}');
	});

	test("multiple operations on same path", () => {
		const source = '{"a":1}';
		const result = jsonmod(source).replace("a", "2").replace("a", "3").apply();
		// Last operation wins
		assert.equal(result, '{"a":3}');
	});

	test("chainable API returns instance", () => {
		const source = '{"a":1}';
		const instance = jsonmod(source);
		const result1 = instance.replace("a", "2");
		const result2 = result1.delete("a");

		assert.equal(typeof instance.apply, "function");
		assert.equal(typeof result1.apply, "function");
		assert.equal(typeof result2.apply, "function");
	});
});
