/**
 * Helper utilities for formatting values to use in patches.
 * These functions make it easier to create patch values without manually adding quotes.
 */

/**
 * Formats a JavaScript value into a JSON string representation for use in patches.
 * @param {any} value - The value to format
 * @returns {string} - A JSON string representation
 * @example
 * formatValue(42) // "42"
 * formatValue("hello") // '"hello"'
 * formatValue(true) // "true"
 * formatValue({a: 1}) // '{"a":1}'
 */
export function formatValue(value) {
	return JSON.stringify(value);
}

/**
 * Formats a string value for use in patches (adds quotes).
 * @param {string} value - The string value
 * @returns {string} - The quoted string
 * @example
 * string("hello") // '"hello"'
 */
export function string(value) {
	return JSON.stringify(value);
}

/**
 * Formats a number value for use in patches.
 * @param {number} value - The number value
 * @returns {string} - The number as a string
 * @example
 * number(42) // "42"
 */
export function number(value) {
	return String(value);
}

/**
 * Formats a boolean value for use in patches.
 * @param {boolean} value - The boolean value
 * @returns {string} - "true" or "false"
 * @example
 * boolean(true) // "true"
 */
export function boolean(value) {
	return String(value);
}

/**
 * Returns the null value for use in patches.
 * @returns {string} - "null"
 * @example
 * nullValue() // "null"
 */
export function nullValue() {
	return "null";
}

/**
 * Formats an object value for use in patches.
 * @param {object} value - The object value
 * @returns {string} - The JSON stringified object
 * @example
 * object({a: 1, b: 2}) // '{"a":1,"b":2}'
 */
export function object(value) {
	return JSON.stringify(value);
}

/**
 * Formats an array value for use in patches.
 * @param {array} value - The array value
 * @returns {string} - The JSON stringified array
 * @example
 * array([1, 2, 3]) // '[1,2,3]'
 */
export function array(value) {
	return JSON.stringify(value);
}
