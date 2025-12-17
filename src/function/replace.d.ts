export interface ReplacePatch {
	/**
	 * A JSON path where the replacement should occur.
	 */
	path: string;
	/**
	 * The value to insert at the specified path.
	 */
	value: string;
}

export declare function replace(sourceText: string, patches: Array<ReplacePatch>): string;
