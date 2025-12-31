/**
 * JsonMod - A chainable API for modifying JSON strings while preserving formatting
 */
export declare class JsonMod {
	/**
	 * Creates a new JsonMod instance
	 * @param sourceText - The JSON string to modify
	 */
	constructor(sourceText: string);

	/**
	 * Replace a value at the specified path
	 * @param path - The JSON path or array of path segments
	 * @param value - The new value as a JSON string
	 * @returns Returns this for chaining
	 * @example
	 * jsonmod(source).replace("user.name", '"Bob"').apply()
	 * jsonmod(source).replace(["user", "name"], '"Bob"').apply()
	 */
	replace(path: string | string[], value: string): JsonMod;

	/**
	 * Delete a property or array element at the specified path
	 * @param path - The JSON path or array of path segments
	 * @returns Returns this for chaining
	 * @example
	 * jsonmod(source).delete("user.age").apply()
	 * jsonmod(source).remove(["user", "age"]).apply()
	 */
	delete(path: string | string[]): JsonMod;

	/**
	 * Alias for delete()
	 * @param path - The JSON path or array of path segments
	 * @returns Returns this for chaining
	 */
	remove(path: string | string[]): JsonMod;

	/**
	 * Insert a new property into an object or element into an array
	 * @param path - The JSON path pointing to the object/array
	 * @param keyOrPosition - For objects: property name; For arrays: index
	 * @param value - The value to insert as a JSON string
	 * @returns Returns this for chaining
	 * @example
	 * jsonmod(source).insert("user", "email", '"test@example.com"').apply()
	 * jsonmod(source).insert("items", 0, '"newItem"').apply()
	 */
	insert(path: string | string[], keyOrPosition: string | number, value: string): JsonMod;

	/**
	 * Apply all queued operations and return the modified JSON string
	 * @returns The modified JSON string
	 */
	apply(): string;
}

/**
 * Factory function to create a new JsonMod instance
 * @param sourceText - The JSON string to modify
 * @returns A new JsonMod instance
 * @example
 * jsonmod(source).replace("a", "10").delete("b").apply()
 */
export declare function jsonmod(sourceText: string): JsonMod;
