/**
 * CST（具体语法树）构建器类
 * 
 * 什么是 CST？
 * CST (Concrete Syntax Tree，具体语法树) 是对源代码结构的精确表示，
 * 它保留了所有细节，包括空格、注释、标点符号等。
 * 
 * CST 与 AST 的区别：
 * - AST (抽象语法树)：只保留语义信息，忽略格式细节
 *   例如："  {  "a"  :  1  }" 和 '{"a":1}' 生成相同的 AST
 * - CST (具体语法树)：保留所有细节，包括空格和注释的位置
 *   例如："  {  "a"  :  1  }" 会完整记录每个空格的位置
 * 
 * 为什么要用 CST？
 * 因为我们需要修改 JSON 的同时保持原有的格式和注释，
 * 所以必须知道每个元素在原文本中的精确位置。
 * 
 * 工作流程：
 * 1. 接收 Tokenizer 生成的 token 数组
 * 2. 按照 JSON 语法规则，将 token 组装成树形结构
 * 3. 每个节点记录其在原文本中的位置（start 和 end）
 */
export class CSTBuilder {
	/**
	 * 构造函数
	 * @param {Array} tokens - Tokenizer 生成的 token 数组
	 */
	constructor(tokens) {
		this.tokens = tokens;  // 保存 token 数组
		this.pos = 0;          // 当前处理的 token 位置
	}

	/**
	 * 主构建方法：将 token 数组转换为 CST
	 * 
	 * @returns {Object} CST 根节点
	 */
	build() {
		this.skipTrivia();           // 跳过开头的空白和注释
		const node = this.parseValue();  // 解析主值
		this.skipTrivia();           // 跳过结尾的空白和注释
		return node;
	}

	/**
	 * 获取当前位置的 token
	 * @returns {Object} 当前 token
	 */
	current() {
		return this.tokens[this.pos];
	}

	/**
	 * 跳过无关紧要的 token（空白符和注释）
	 * 
	 * 什么是 Trivia？
	 * Trivia 是编程语言中对代码逻辑无影响的内容，如：
	 * - 空格、换行、制表符等空白字符
	 * - 注释
	 * 
	 * 为什么要跳过？
	 * 在解析语法结构时，我们关心的是实际的值和符号，
	 * 而不是它们之间的空白和注释。
	 * 但我们不会删除它们，只是在解析时暂时忽略。
	 */
	skipTrivia() {
		while (this.pos < this.tokens.length && (this.tokens[this.pos].type === "whitespace" || this.tokens[this.pos].type === "comment")) {
			this.pos++;
		}
	}

	/**
	 * 消费（读取并移动到下一个）指定类型的 token
	 * 
	 * @param {string} type - 期望的 token 类型
	 * @returns {Object} 被消费的 token
	 * @throws {Error} 如果当前 token 类型不匹配
	 */
	consume(type) {
		const token = this.current();
		// 检查 token 类型是否匹配
		if (!token || token.type !== type) {
			throw new Error(`Expected ${type}, got ${token && token.type}`);
		}
		this.pos++;  // 移动到下一个 token
		return token;
	}

	/**
	 * 解析一个 JSON 值
	 * 
	 * JSON 值可以是以下任意类型：
	 * - 对象：{ "key": "value" }
	 * - 数组：[1, 2, 3]
	 * - 字符串："hello"
	 * - 数字：123
	 * - 布尔值：true 或 false
	 * - 空值：null
	 * 
	 * @returns {Object} 值节点
	 */
	parseValue() {
		this.skipTrivia();  // 跳过值前面的空白和注释
		const token = this.current();

		if (!token) {
			throw new Error("Unexpected end of input");
		}

		// 根据 token 类型，调用相应的解析方法
		switch (token.type) {
			case "braceL":      // { - 左花括号，解析对象
				return this.parseObject();
			case "bracketL":    // [ - 左方括号，解析数组
				return this.parseArray();
			case "string":      // 字符串
				return this.parsePrimitive("String");
			case "number":      // 数字
				return this.parsePrimitive("Number");
			case "boolean":     // 布尔值
				return this.parsePrimitive("Boolean");
			case "null":        // 空值
				return this.parsePrimitive("Null");
			default:
				throw new Error(`Unexpected token: ${token.type}`);
		}
	}

	/**
	 * 解析基本类型值（字符串、数字、布尔值、null）
	 * 
	 * 基本类型的特点：
	 * - 它们都是单个 token，不包含子节点
	 * - 只需要记录类型和位置信息
	 * 
	 * @param {string} type - 节点类型
	 * @returns {Object} 基本类型节点
	 */
	parsePrimitive(type) {
		const token = this.current();
		this.pos++;  // 移动到下一个 token
		return {
			type,
			start: token.start,  // 在原文本中的起始位置
			end: token.end,      // 在原文本中的结束位置
		};
	}

	/**
	 * 解析 JSON 对象
	 * 
	 * 对象的语法结构：
	 * {
	 *   "key1": value1,
	 *   "key2": value2,
	 *   ...
	 * }
	 * 
	 * 解析步骤：
	 * 1. 读取左花括号 {
	 * 2. 循环读取键值对，直到遇到右花括号 }
	 *    - 读取字符串作为键
	 *    - 读取冒号 :
	 *    - 递归解析值
	 *    - 如果有逗号 , 则继续读取下一个键值对
	 * 3. 读取右花括号 }
	 * 
	 * @returns {Object} 对象节点
	 */
	parseObject() {
		const startToken = this.consume("braceL");  // 消费左花括号 {
		const properties = [];  // 存储所有属性（键值对）

		this.skipTrivia();  // 跳过 { 后面的空白

		// 循环读取属性，直到遇到右花括号
		while (this.current() && this.current().type !== "braceR") {
			// 1. 读取键（必须是字符串）
			const keyToken = this.consume("string");
			const keyNode = {
				type: "String",
				start: keyToken.start,
				end: keyToken.end,
			};

			// 2. 跳过键后面的空白
			this.skipTrivia();
			// 3. 读取冒号 :
			this.consume("colon");
			// 4. 跳过冒号后面的空白
			this.skipTrivia();

			// 5. 递归解析值（值可以是任意 JSON 类型）
			const valueNode = this.parseValue();

			// 6. 将键值对添加到属性列表
			properties.push({ key: keyNode, value: valueNode });

			// 7. 跳过值后面的空白
			this.skipTrivia();
			// 8. 如果有逗号，消费它并继续；否则准备结束
			if (this.current() && this.current().type === "comma") {
				this.pos++;
				this.skipTrivia();
			}
		}

		// 消费右花括号 }
		const endToken = this.consume("braceR");

		// 返回对象节点
		return {
			type: "Object",
			start: startToken.start,  // 对象起始位置（左花括号的位置）
			end: endToken.end,        // 对象结束位置（右花括号的位置）
			properties,               // 所有属性
		};
	}

	/**
	 * 解析 JSON 数组
	 * 
	 * 数组的语法结构：
	 * [
	 *   value1,
	 *   value2,
	 *   ...
	 * ]
	 * 
	 * 解析步骤：
	 * 1. 读取左方括号 [
	 * 2. 循环读取元素，直到遇到右方括号 ]
	 *    - 递归解析值
	 *    - 如果有逗号 , 则继续读取下一个元素
	 * 3. 读取右方括号 ]
	 * 
	 * @returns {Object} 数组节点
	 */
	parseArray() {
		const startToken = this.consume("bracketL");  // 消费左方括号 [
		const elements = [];  // 存储所有元素

		this.skipTrivia();  // 跳过 [ 后面的空白

		// 循环读取元素，直到遇到右方括号
		while (this.current() && this.current().type !== "bracketR") {
			// 1. 递归解析值（值可以是任意 JSON 类型）
			const valueNode = this.parseValue();
			// 2. 将值添加到元素列表
			elements.push(valueNode);

			// 3. 跳过值后面的空白
			this.skipTrivia();
			// 4. 如果有逗号，消费它并继续；否则准备结束
			if (this.current() && this.current().type === "comma") {
				this.pos++;
				this.skipTrivia();
			}
		}

		// 消费右方括号 ]
		const endToken = this.consume("bracketR");

		// 返回数组节点
		return {
			type: "Array",
			start: startToken.start,  // 数组起始位置（左方括号的位置）
			end: endToken.end,        // 数组结束位置（右方括号的位置）
			elements,                 // 所有元素
		};
	}
}
