export interface InsertPatchArray {
	/**
	 * A JSON path where the insertion should occur.
	 * For arrays: the path should point to the array, and position specifies the index.
	 * For objects: the path should point to the object, and key specifies the property name.
	 */
	path: string;
	/**
	 * For array insertion: the index where to insert the value.
	 */
	position: number;
	/**
	 * The value to insert.
	 */
	value: string;
}

export interface InsertPatchObject {
	/**
	 * A JSON path where the insertion should occur.
	 * For arrays: the path should point to the array, and position specifies the index.
	 * For objects: the path should point to the object, and key specifies the property name.
	 */
	path: string;
	/**
	 * For object insertion: the key name for the new property.
	 */
	key: string;
	/**
	 * The value to insert.
	 */
	value: string;
}

export type InsertPatch = InsertPatchArray | InsertPatchObject;

export declare function insert(sourceText: string, patches: Array<InsertPatch>): string;
