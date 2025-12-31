# v2.0.0 Release Summary

## 🎯 Overview

Version 2.0.0 is a major release that improves the API design of json-codemod by introducing **value helper utilities** and **requiring explicit operation types** in batch operations.

## ⚠️ Breaking Changes

### Batch Operations Require Explicit Operation Types

The `batch()` function now requires all patches to include an explicit `operation` field.

**Before (v1.x - NO LONGER WORKS):**
```javascript
batch(source, [
  { path: "a", value: "10" },
  { path: "b" }
]);
```

**After (v2.x - REQUIRED):**
```javascript
batch(source, [
  { operation: "replace", path: "a", value: "10" },
  { operation: "delete", path: "b" }
]);
```

**Migration:** See [MIGRATION.md](./MIGRATION.md) for complete migration instructions.

## ✨ New Features

### 1. Value Helper Utilities

Seven new helper functions make value formatting intuitive:

```javascript
import { formatValue, string, number, boolean, nullValue, object, array } from 'json-codemod';

formatValue(42)          // "42"
formatValue("hello")     // '"hello"'
formatValue(true)        // "true"
formatValue(null)        // "null"
formatValue({a: 1})      // '{"a":1}'
formatValue([1, 2, 3])   // '[1,2,3]'

// Or use type-specific helpers
string("hello")          // '"hello"'
number(42)               // "42"
boolean(true)            // "true"
```

**Benefits:**
- Eliminates manual quote handling
- Reduces common mistakes
- More intuitive API

### 2. Enhanced Error Messages

Clear, actionable error messages:

```
Error: Operation type is required. Please specify operation: "replace", "delete", or "insert" for patch at path "yourPath"

Error: Invalid operation type "update". Must be "replace", "delete", "remove", or "insert" for patch at path "yourPath"

Error: Replace operation requires 'value' property for patch at path "yourPath"
```

### 3. Better TypeScript Support

All new types are properly exported:
- `ExplicitReplacePatch`
- `ExplicitDeletePatch`
- `ExplicitInsertPatch`
- Value helper types

## 🔧 What's NOT Changed

These functions remain **fully backward compatible**:

- ✅ `replace(sourceText, patches)` - No changes
- ✅ `remove(sourceText, patches)` - No changes
- ✅ `insert(sourceText, patches)` - No changes

## 📊 Why These Changes?

### Problems Solved

1. **Confusing Value Parameter**
   - **Problem:** Users forgot to add quotes for strings: `'"hello"'`
   - **Solution:** `formatValue("hello")` handles it automatically

2. **Implicit Operation Detection**
   - **Problem:** Not clear what operation each patch performs
   - **Solution:** Explicit `operation` field makes intent obvious

3. **Missing Type Exports**
   - **Problem:** TypeScript users couldn't properly type patches
   - **Solution:** All types now properly exported

### Benefits

1. **Self-Documenting Code**
   ```javascript
   // Clear and obvious
   { operation: "replace", path: "age", value: formatValue(31) }
   
   // vs ambiguous
   { path: "age", value: "31" }
   ```

2. **Better Developer Experience**
   - No need to remember implicit detection rules
   - Autocomplete and type checking work better
   - Fewer errors from formatting mistakes

3. **Easier Code Review**
   - Reviewers immediately understand intent
   - No mental overhead
   - Self-explanatory patches

4. **Prevention of Bugs**
   - Can't forget operation types
   - Can't forget quotes on strings
   - Clear errors when something's wrong

## 📝 Complete Example

### Configuration File Management (v2.0)

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

## 🧪 Testing

- **93 tests** - All passing
- **ESM build** - Verified working
- **CJS build** - Verified working
- **Coverage** - Comprehensive test coverage for all features

## 📚 Documentation

New and updated documentation:

1. **[MIGRATION.md](./MIGRATION.md)** - Complete migration guide for v2.0
2. **[API_IMPROVEMENTS.md](./API_IMPROVEMENTS.md)** - Detailed explanation of improvements
3. **[README.md](./README.md)** - Updated with new features and examples

## 🚀 Getting Started

### Installation

```bash
npm install json-codemod@2.0.0
```

### Basic Usage

```javascript
import { batch, formatValue } from 'json-codemod';

const source = '{"name": "Alice", "age": 30}';

const result = batch(source, [
  { operation: "replace", path: "name", value: formatValue("Bob") },
  { operation: "replace", path: "age", value: formatValue(31) }
]);

console.log(result);
// Output: {"name": "Bob", "age": 31}
```

## 🔄 Migration Path

1. **Update package version:**
   ```bash
   npm install json-codemod@2.0.0
   ```

2. **Update batch() calls:**
   - Add `operation` field to all patches
   - Optionally use value helpers

3. **Run tests:**
   ```bash
   npm test
   ```

4. **See [MIGRATION.md](./MIGRATION.md) for detailed steps**

## 📊 Statistics

- **Lines of code added:** ~500 (features + tests + docs)
- **Tests added:** 4 new tests for explicit operations
- **Functions added:** 7 value helper functions
- **Documentation:** 3 comprehensive documents

## 🙏 Acknowledgments

This release addresses user feedback about API clarity and usability while maintaining the core philosophy of preserving JSON formatting and comments.

## 🔗 Resources

- [Migration Guide](./MIGRATION.md)
- [API Improvements](./API_IMPROVEMENTS.md)
- [README](./README.md)
- [GitHub Repository](https://github.com/axetroy/json-codemod)
- [npm Package](https://www.npmjs.com/package/json-codemod)

---

**Version:** 2.0.0  
**Release Date:** 2025  
**Type:** Major (Breaking Changes)
