/**
 * Helper utilities for formatting values to use in patches.
 * These functions make it easier to create patch values without manually adding quotes.
 */

/**
 * Formats a JavaScript value into a JSON string representation for use in patches.
 * @param value - The value to format
 * @returns A JSON string representation
 * @example
 * formatValue(42) // "42"
 * formatValue("hello") // '"hello"'
 * formatValue(true) // "true"
 * formatValue({a: 1}) // '{"a":1}'
 */
export declare function formatValue(value: any): string;

/**
 * Formats a string value for use in patches (adds quotes).
 * @param value - The string value
 * @returns The quoted string
 * @example
 * string("hello") // '"hello"'
 */
export declare function string(value: string): string;

/**
 * Formats a number value for use in patches.
 * @param value - The number value
 * @returns The number as a string
 * @example
 * number(42) // "42"
 */
export declare function number(value: number): string;

/**
 * Formats a boolean value for use in patches.
 * @param value - The boolean value
 * @returns "true" or "false"
 * @example
 * boolean(true) // "true"
 */
export declare function boolean(value: boolean): string;

/**
 * Returns the null value for use in patches.
 * @returns "null"
 * @example
 * nullValue() // "null"
 */
export declare function nullValue(): string;

/**
 * Formats an object value for use in patches.
 * @param value - The object value
 * @returns The JSON stringified object
 * @example
 * object({a: 1, b: 2}) // '{"a":1,"b":2}'
 */
export declare function object(value: object): string;

/**
 * Formats an array value for use in patches.
 * @param value - The array value
 * @returns The JSON stringified array
 * @example
 * array([1, 2, 3]) // '[1,2,3]'
 */
export declare function array(value: any[]): string;
