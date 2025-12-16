# jsoncst

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/jsoncst.svg)](https://badge.fury.io/js/jsoncst)

A utility to patch JSON strings while preserving the original formatting, including comments and whitespace.

## ✨ Features

- 🎨 **Format Preservation** - Maintains comments, whitespace, and original formatting
- 🔄 **Precise Modifications** - Only changes specified values, leaving everything else intact
- 🚀 **Fast & Lightweight** - Zero dependencies, minimal footprint
- 📦 **Zero Configuration** - Works out of the box with sensible defaults
- 💪 **TypeScript Support** - Full type definitions included
- 🎯 **Flexible Path Syntax** - Supports both dot notation and JSON Pointer

## 📦 Installation

```bash
npm install jsoncst
```

Or using other package managers:

```bash
yarn add jsoncst
# or
pnpm add jsoncst
```

## 🚀 Quick Start

### Basic Usage

```js
import { replace } from "jsoncst";

const source = '{"name": "Alice", "age": 30}';

// Replace a single value
const result = replace(source, [
  { path: "age", value: "31" }
]);

console.log(result);
// Output: {"name": "Alice", "age": 31}
```

### Preserving Format and Comments

```js
const source = `{
  // User information
  "name": "Alice",
  "age": 30, /* years old */
  "city": "Beijing"
}`;

const result = replace(source, [
  { path: "age", value: "31" }
]);

console.log(result);
// Output: {
//   // User information
//   "name": "Alice",
//   "age": 31, /* years old */
//   "city": "Beijing"
// }
```

## 📖 Usage Examples

### Modifying Nested Objects

```js
const source = '{"user": {"name": "Alice", "profile": {"age": 30}}}';

const result = replace(source, [
  { path: "user.profile.age", value: "31" }
]);

// Result: {"user": {"name": "Alice", "profile": {"age": 31}}}
```

### Modifying Array Elements

```js
const source = '{"scores": [85, 90, 95]}';

const result = replace(source, [
  { path: "scores[1]", value: "92" }
]);

// Result: {"scores": [85, 92, 95]}
```

### Using JSON Pointer

```js
const source = '{"data": {"items": [1, 2, 3]}}';

const result = replace(source, [
  { path: "/data/items/2", value: "99" }
]);

// Result: {"data": {"items": [1, 2, 99]}}
```

### Batch Modifications

```js
const source = '{"x": 1, "y": 2, "arr": [3, 4]}';

const result = replace(source, [
  { path: "x", value: "10" },
  { path: "y", value: "20" },
  { path: "arr[0]", value: "30" }
]);

// Result: {"x": 10, "y": 20, "arr": [30, 4]}
```

### Modifying String Values

```js
const source = '{"message": "Hello"}';

const result = replace(source, [
  { path: "message", value: '"World"' }
]);

// Result: {"message": "World"}
// Note: value needs to include quotes for strings
```

### Modifying Complex Values

```js
const source = '{"config": {"timeout": 3000}}';

// Replace with an object
const result1 = replace(source, [
  { path: "config", value: '{"timeout": 5000, "retry": 3}' }
]);

// Replace with an array
const result2 = replace(source, [
  { path: "config", value: '[1, 2, 3]' }
]);
```

### Handling Special Characters in Keys

Use JSON Pointer to handle keys with special characters:

```js
const source = '{"a/b": {"c~d": 5}}';

// In JSON Pointer:
// ~0 represents ~
// ~1 represents /
const result = replace(source, [
  { path: "/a~1b/c~0d", value: "42" }
]);

// Result: {"a/b": {"c~d": 42}}
```

## 📚 API Documentation

### `replace(sourceText, patches)`

Modifies values in a JSON string.

#### Parameters

- **sourceText** (`string`): The original JSON string
- **patches** (`Array<Patch>`): Array of modifications to apply

#### Patch Object

```typescript
interface Patch {
  path: string;    // Path to the value
  value: string;   // New value (as a string)
}
```

#### Path Syntax

Two path syntaxes are supported:

1. **Dot Notation** (recommended for simple cases)
   - Object properties: `"user.name"`
   - Array indices: `"items[0]"`
   - Nested paths: `"data.users[0].name"`

2. **JSON Pointer** (RFC 6901)
   - Format: starts with `/`
   - Object properties: `"/user/name"`
   - Array indices: `"/items/0"`
   - Escape sequences:
     - `~0` represents `~`
     - `~1` represents `/`
   - Example: `"/a~1b/c~0d"` refers to the `c~d` property of the `a/b` object

#### Value Format

The `value` parameter must be a string representation of a JSON value:

- Numbers: `"42"`, `"3.14"`
- Strings: `'"hello"'` (must include quotes)
- Booleans: `"true"`, `"false"`
- null: `"null"`
- Objects: `'{"key": "value"}'`
- Arrays: `'[1, 2, 3]'`

#### Return Value

Returns the modified JSON string.

#### Error Handling

- If a path doesn't exist, that modification is silently ignored without throwing an error
- If multiple modifications have conflicting (overlapping) paths, an error is thrown

## 🎯 Use Cases

### Configuration File Modification

Perfect for modifying configuration files with comments (like `tsconfig.json`, `package.json`, etc.):

```js
import { readFileSync, writeFileSync } from 'fs';
import { replace } from 'jsoncst';

// Read configuration file
const config = readFileSync('tsconfig.json', 'utf-8');

// Modify configuration
const updated = replace(config, [
  { path: "compilerOptions.target", value: '"ES2020"' },
  { path: "compilerOptions.strict", value: "true" }
]);

// Save configuration (preserving original format and comments)
writeFileSync('tsconfig.json', updated);
```

### JSON Data Transformation

```js
// Batch update JSON data
const data = fetchDataAsString();

const updated = replace(data, [
  { path: "metadata.version", value: '"2.0"' },
  { path: "metadata.updatedAt", value: `"${new Date().toISOString()}"` }
]);
```

### Automation Scripts

```js
// Automated version number updates
const pkg = readFileSync('package.json', 'utf-8');
const version = '1.2.3';

const updated = replace(pkg, [
  { path: "version", value: `"${version}"` }
]);

writeFileSync('package.json', updated);
```

## 💻 TypeScript Support

The package includes full TypeScript type definitions:

```typescript
import { replace } from "jsoncst";

interface Patch {
  path: string;
  value: string;
}

const source: string = '{"count": 0}';
const patches: Patch[] = [
  { path: "count", value: "1" }
];

const result: string = replace(source, patches);
```

## 🔧 How It Works

jsoncst uses Concrete Syntax Tree (CST) technology:

1. **Tokenization** (Tokenizer): Breaks down the JSON string into tokens, including values, whitespace, and comments
2. **Parsing** (CSTBuilder): Builds a syntax tree that preserves all formatting information
3. **Path Resolution** (PathResolver): Locates the node to modify based on the path
4. **Precise Replacement**: Replaces only the target value, preserving everything else

This approach ensures that everything except the modified values (including whitespace, comments, and formatting) remains unchanged.

## ❓ FAQ

### Q: Why does the value parameter need to be a string?

A: For flexibility and precision. You have complete control over the output format, including quotes, spacing, etc.

```js
// Numbers don't need quotes
replace(source, [{ path: "age", value: "30" }]);

// Strings need quotes
replace(source, [{ path: "name", value: '"Alice"' }]);

// You can control formatting
replace(source, [{ path: "data", value: '{\n  "key": "value"\n}' }]);
```

### Q: How are non-existent paths handled?

A: If a path doesn't exist, that modification is automatically ignored without throwing an error. The original string remains unchanged.

### Q: What JSON extensions are supported?

A: Supported:
- ✅ Single-line comments `//`
- ✅ Block comments `/* */`
- ✅ All standard JSON syntax

Not supported:
- ❌ Other JSON5 features (like unquoted keys, trailing commas, etc.)

### Q: How is the performance?

A: jsoncst is specifically designed for precise modifications with excellent performance. For large files (hundreds of KB), parsing and modification typically complete in milliseconds.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to the project:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [Anti 996 License](LICENSE).

## 🔗 Links

- [npm package](https://www.npmjs.com/package/jsoncst)
- [GitHub repository](https://github.com/axetroy/jsoncst)
- [Issue tracker](https://github.com/axetroy/jsoncst/issues)

## 🌟 Star History

If this project helps you, please give it a ⭐️!
