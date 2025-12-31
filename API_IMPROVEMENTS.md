# API Improvements (API 改进说明)

## ⚠️ Breaking Changes in v2.0

**Version 2.0 introduces breaking changes.** The `batch()` function now requires explicit operation types.

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions.

## Overview (概述)

This document describes the API improvements made to json-codemod to address several unreasonable aspects of the original API design.

## Issues Identified (已识别的问题)

### 1. Confusing Value Parameter (易混淆的 value 参数)

**Problem:** Users had to manually format values as strings, leading to confusion and errors:
- Numbers: `"42"`
- Strings: `'"hello"'` (must include quotes)
- Booleans: `"true"` / `"false"`
- Objects: `'{"key": "value"}'`

**Impact:** Error-prone, especially for beginners who forget to add quotes for strings.

### 2. Implicit Operation Detection (隐式操作类型检测)

**Problem:** The `batch()` function used implicit type detection based on properties:
- Has `value` but no `key`/`position` → replace
- No `value`, `key`, or `position` → delete
- Has `key` or `position` with `value` → insert

**Impact:** Not immediately clear what operation each patch performs; requires understanding of the detection logic.

### 3. Missing Type Exports (缺少类型导出)

**Problem:** Not all TypeScript types were properly exported for use in application code.

**Impact:** TypeScript users couldn't properly type their patch operations.

## Solutions Implemented (实施的解决方案)

### 1. Value Helper Utilities (值格式化工具函数)

Added helper functions to make value formatting intuitive and less error-prone:

```javascript
import { formatValue, string, number, boolean, nullValue, object, array } from 'json-codemod';

// Generic formatter - works with any type
formatValue(42)          // "42"
formatValue("hello")     // '"hello"'
formatValue(true)        // "true"
formatValue(null)        // "null"
formatValue({a: 1})      // '{"a":1}'
formatValue([1, 2, 3])   // '[1,2,3]'

// Type-specific helpers
string("hello")          // '"hello"'
number(42)               // "42"
boolean(true)            // "true"
nullValue()              // "null"
object({a: 1})           // '{"a":1}'
array([1, 2, 3])         // '[1,2,3]'
```

**Usage Example:**

```javascript
import { replace, formatValue } from 'json-codemod';

const source = '{"name": "Alice", "age": 30}';

// Before (error-prone)
const result1 = replace(source, [
  { path: "name", value: '"Bob"' },  // Easy to forget quotes
  { path: "age", value: "31" }
]);

// After (intuitive)
const result2 = replace(source, [
  { path: "name", value: formatValue("Bob") },  // Automatic quote handling
  { path: "age", value: formatValue(31) }
]);
```

### 2. Explicit Operation Types (显式操作类型) - ⚠️ BREAKING CHANGE

**Version 2.0 Change:** The `operation` field is now **required** in all batch patches.

```javascript
import { batch } from 'json-codemod';

const source = '{"a": 1, "b": 2, "items": [1, 2]}';

// ❌ v1.x - implicit detection (NO LONGER SUPPORTED)
const result1 = batch(source, [
  { path: "a", value: "10" },              // Was implicitly detected as replace
  { path: "b" },                            // Was implicitly detected as delete
  { path: "items", position: 2, value: "3" }  // Was implicitly detected as insert
]);

// ✅ v2.x - explicit operation types (REQUIRED)
const result2 = batch(source, [
  { operation: "replace", path: "a", value: "10" },
  { operation: "delete", path: "b" },
  { operation: "insert", path: "items", position: 2, value: "3" }
]);

// Both "delete" and "remove" are supported for the delete operation
const result3 = batch(source, [
  { operation: "remove", path: "b" }
]);
```

**Benefits:**
- ✅ Code is self-documenting
- ✅ Easier to understand intent at a glance
- ✅ No mental overhead remembering implicit rules
- ✅ Prevents ambiguity and bugs
- ✅ Better error messages

### 3. Enhanced TypeScript Support (增强的 TypeScript 支持)

All types are now properly exported:

```typescript
import {
  replace,
  remove,
  insert,
  batch,
  ReplacePatch,
  DeletePatch,
  InsertPatch,
  BatchPatch,
  ExplicitReplacePatch,
  ExplicitDeletePatch,
  ExplicitInsertPatch,
  formatValue
} from 'json-codemod';

// Implicit types (backward compatible)
const implicitPatches: BatchPatch[] = [
  { path: "a", value: "1" },
  { path: "b" }
];

// Explicit types (recommended)
const explicitPatches: BatchPatch[] = [
  { operation: "replace", path: "a", value: "1" },
  { operation: "delete", path: "b" }
];

// Using value helpers
const source = '{"count": 0}';
const result = replace(source, [
  { path: "count", value: formatValue(42) }
]);
```

## Migration Guide (迁移指南)

### ⚠️ Breaking Changes in v2.0

**Version 2.0 requires explicit operation types in the `batch()` function.**

See the dedicated [MIGRATION.md](./MIGRATION.md) file for complete migration instructions.

#### Quick Migration Summary

```javascript
// ❌ v1.x - NO LONGER WORKS
batch(source, [
  { path: "a", value: "10" },
  { path: "b" },
  { path: "items", position: 2, value: "3" }
]);

// ✅ v2.x - REQUIRED
batch(source, [
  { operation: "replace", path: "a", value: "10" },
  { operation: "delete", path: "b" },
  { operation: "insert", path: "items", position: 2, value: "3" }
]);
```

### Other Functions (Unchanged)

The `replace()`, `remove()`, and `insert()` functions remain unchanged and fully backward compatible.

## Examples (示例)

### Complete Example: Configuration File Update

```javascript
import { batch, formatValue } from 'json-codemod';
import { readFileSync, writeFileSync } from 'fs';

// Read configuration
const config = readFileSync('tsconfig.json', 'utf-8');

// Update with explicit operations and value helpers
const updated = batch(config, [
  // Update compiler options
  { 
    operation: "replace", 
    path: "compilerOptions.target", 
    value: formatValue("ES2022") 
  },
  { 
    operation: "replace", 
    path: "compilerOptions.strict", 
    value: formatValue(true) 
  },
  // Remove old option
  { 
    operation: "delete", 
    path: "compilerOptions.experimentalDecorators" 
  },
  // Add new option
  { 
    operation: "insert", 
    path: "compilerOptions", 
    key: "moduleResolution", 
    value: formatValue("bundler") 
  }
]);

// Save (preserves comments and formatting)
writeFileSync('tsconfig.json', updated);
```

### Complete Example: Package.json Management

```javascript
import { batch, formatValue, remove } from 'json-codemod';
import { readFileSync, writeFileSync } from 'fs';

const pkg = readFileSync('package.json', 'utf-8');

// Update version and dependencies
const updated = batch(pkg, [
  // Bump version
  { 
    operation: "replace", 
    path: "version", 
    value: formatValue("2.0.0") 
  },
  // Add new dependency
  { 
    operation: "insert", 
    path: "dependencies", 
    key: "typescript", 
    value: formatValue("^5.0.0") 
  },
  // Remove old dependency
  { 
    operation: "delete", 
    path: "dependencies.old-package" 
  }
]);

writeFileSync('package.json', updated);
```

## Benefits Summary (改进总结)

1. **Better Developer Experience (更好的开发体验)**
   - Value helpers eliminate common mistakes
   - Explicit operations make code self-documenting
   - Less cognitive load

2. **Improved Type Safety (改进的类型安全)**
   - All types properly exported
   - Better TypeScript integration
   - Clearer type definitions

3. **Backward Compatible (向后兼容)**
   - All existing code continues to work
   - No breaking changes
   - Gradual adoption path

4. **More Maintainable (更易维护)**
   - Explicit operations make intent clear
   - Easier to review and understand code
   - Self-documenting API

## Conclusion (结论)

These improvements address the key pain points of the original API while maintaining full backward compatibility. The new features are optional but recommended for better code clarity and fewer errors.
