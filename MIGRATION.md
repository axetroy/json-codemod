# Migration Guide - v2.0.0

## Breaking Changes

Version 2.0.0 introduces breaking changes that require explicit operation types in the `batch()` function. This change eliminates ambiguity and makes code more maintainable.

## What Changed

### ⚠️ Batch Operations Now Require Explicit Operation Types

Previously, the `batch()` function used implicit operation detection based on patch properties. This has been removed to eliminate ambiguity.

#### Before (v1.x)

```js
import { batch } from "json-codemod";

const source = '{"a": 1, "b": 2, "items": [1, 2]}';

// Implicit operation detection (NO LONGER SUPPORTED)
const result = batch(source, [
	{ path: "a", value: "10" },              // Was detected as replace
	{ path: "b" },                            // Was detected as delete
	{ path: "items", position: 2, value: "3" } // Was detected as insert
]);
```

#### After (v2.x)

```js
import { batch } from "json-codemod";

const source = '{"a": 1, "b": 2, "items": [1, 2]}';

// Explicit operation types (REQUIRED)
const result = batch(source, [
	{ operation: "replace", path: "a", value: "10" },
	{ operation: "delete", path: "b" },
	{ operation: "insert", path: "items", position: 2, value: "3" }
]);
```

## Migration Steps

### Step 1: Identify All `batch()` Calls

Search your codebase for all uses of the `batch()` function:

```bash
grep -r "batch(" src/
```

### Step 2: Add Explicit Operation Types

For each patch in your `batch()` calls, add the appropriate `operation` field:

#### Replace Operation

```js
// Before
{ path: "key", value: "newValue" }

// After
{ operation: "replace", path: "key", value: "newValue" }
```

#### Delete Operation

```js
// Before
{ path: "key" }

// After
{ operation: "delete", path: "key" }
// or
{ operation: "remove", path: "key" }  // both are supported
```

#### Insert Operation (Array)

```js
// Before
{ path: "array", position: 0, value: "item" }

// After
{ operation: "insert", path: "array", position: 0, value: "item" }
```

#### Insert Operation (Object)

```js
// Before
{ path: "object", key: "newKey", value: "newValue" }

// After
{ operation: "insert", path: "object", key: "newKey", value: "newValue" }
```

### Step 3: Optional - Use Value Helpers

While migrating, consider using the new value helper functions for better developer experience:

```js
import { batch, formatValue } from "json-codemod";

// Before (manual string formatting)
batch(source, [
	{ operation: "replace", path: "name", value: '"Alice"' },
	{ operation: "replace", path: "age", value: "30" }
]);

// After (with value helpers)
batch(source, [
	{ operation: "replace", path: "name", value: formatValue("Alice") },
	{ operation: "replace", path: "age", value: formatValue(30) }
]);
```

### Step 4: Run Tests

After migrating, run your tests to ensure everything works correctly:

```bash
npm test
```

## What Doesn't Change

The following functions remain unchanged and fully backward compatible:

- ✅ `replace()` - No changes
- ✅ `remove()` (alias: `delete()`) - No changes  
- ✅ `insert()` - No changes
- ✅ Value helpers - New addition, fully optional

## Error Messages

If you forget to add the `operation` field, you'll get a clear error message:

```
Error: Operation type is required. Please specify operation: "replace", "delete", or "insert" for patch at path "yourPath"
```

If you provide an invalid operation type:

```
Error: Invalid operation type "update". Must be "replace", "delete", "remove", or "insert" for patch at path "yourPath"
```

## Complete Example

### Before (v1.x)

```js
import { readFileSync, writeFileSync } from "fs";
import { batch } from "json-codemod";

const config = readFileSync("config.json", "utf-8");

const updated = batch(config, [
	{ path: "version", value: '"2.0.0"' },
	{ path: "deprecated" },
	{ path: "features", key: "newFeature", value: "true" }
]);

writeFileSync("config.json", updated);
```

### After (v2.x)

```js
import { readFileSync, writeFileSync } from "fs";
import { batch, formatValue } from "json-codemod";

const config = readFileSync("config.json", "utf-8");

const updated = batch(config, [
	{ operation: "replace", path: "version", value: formatValue("2.0.0") },
	{ operation: "delete", path: "deprecated" },
	{ operation: "insert", path: "features", key: "newFeature", value: formatValue(true) }
]);

writeFileSync("config.json", updated);
```

## Benefits of This Change

1. **Self-Documenting Code**: The operation intent is immediately clear
2. **No Implicit Rules**: No need to remember property-based detection logic
3. **Better Error Messages**: Clear errors when operations are missing or invalid
4. **Easier Code Review**: Reviewers can quickly understand what's happening
5. **TypeScript Support**: Better type checking and autocomplete

## Need Help?

If you encounter any issues during migration:

1. Check the [README.md](./README.md) for updated examples
2. Review [API_IMPROVEMENTS.md](./API_IMPROVEMENTS.md) for detailed explanations
3. Open an issue on [GitHub](https://github.com/axetroy/json-codemod/issues)

## Timeline

- **v1.x**: Supported both implicit and explicit operations (deprecated implicit)
- **v2.0**: Requires explicit operations (breaking change)

We recommend migrating at your earliest convenience to benefit from clearer, more maintainable code.
