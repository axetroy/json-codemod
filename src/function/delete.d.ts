export interface DeletePatch {
	/**
	 * A JSON path to delete.
	 */
	path: string;
}

export declare function remove(sourceText: string, patches: Array<DeletePatch>): string;
