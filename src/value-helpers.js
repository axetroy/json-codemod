/**
 * Helper utility for formatting values to use in patches.
 * This function makes it easier to create patch values without manually adding quotes.
 */

/**
 * Formats a JavaScript value into a JSON string representation for use in patches.
 * Handles all JavaScript types including strings, numbers, booleans, null, objects, and arrays.
 * 
 * @param {any} value - The value to format
 * @returns {string} - A JSON string representation
 * @example
 * formatValue(42) // "42"
 * formatValue("hello") // '"hello"'
 * formatValue(true) // "true"
 * formatValue(null) // "null"
 * formatValue({a: 1}) // '{"a":1}'
 * formatValue([1, 2, 3]) // '[1,2,3]'
 */
export function formatValue(value) {
	return JSON.stringify(value);
}
