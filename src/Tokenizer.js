/**
 * 词法分析器（Tokenizer）类
 * 
 * 作用：将 JSON 文本字符串转换为一系列的"词法单元"（Token）
 * 
 * 什么是 Token？
 * Token 是代码解析的最小单位，类似于将句子拆分成单词。
 * 例如："{"name": 123}" 会被拆分为：
 *   - { (左花括号)
 *   - "name" (字符串)
 *   - : (冒号)
 *   - 123 (数字)
 *   - } (右花括号)
 * 
 * 每个 Token 包含三个信息：
 *   1. type: 类型（如 "string"、"number"、"braceL" 等）
 *   2. start: 在原文本中的起始位置
 *   3. end: 在原文本中的结束位置
 */
class Tokenizer {
	/**
	 * 构造函数
	 * @param {string} text - 要解析的 JSON 文本
	 */
	constructor(text) {
		this.text = text;  // 保存原始文本
		this.pos = 0;      // 当前读取位置，从 0 开始
		this.tokens = [];  // 存储生成的所有 token
	}

	/**
	 * 主解析方法：将文本转换为 token 数组
	 * 
	 * 工作原理：
	 * 1. 从头到尾遍历文本的每个字符
	 * 2. 根据当前字符判断它是什么类型（空白符、字符串、数字等）
	 * 3. 调用相应的读取方法来处理这个类型的内容
	 * 4. 重复直到文本结束
	 * 
	 * @returns {Array} token 数组
	 */
	tokenize() {
		// 遍历整个文本
		while (this.pos < this.text.length) {
			const ch = this.text[this.pos];  // 获取当前字符

			// 根据字符类型，调用不同的读取方法
			if (this.isWhitespace(ch)) {
				// 空白字符（空格、换行、制表符等）
				this.readWhitespace();
			} else if (ch === '"') {
				// 字符串（以双引号开头）
				this.readString();
			} else if (this.isNumberStart(ch)) {
				// 数字（以数字或负号开头）
				this.readNumber();
			} else if (this.isAlpha(ch)) {
				// 关键字（以字母开头，如 true、false、null）
				this.readKeyword();
			} else {
				// 其他符号（如 {}[],:）或注释
				this.readPunctuationOrComment();
			}
		}

		return this.tokens;
	}

	// ========== 辅助判断方法 ==========
	// 这些方法用于判断字符的类型

	/**
	 * 判断字符是否为空白符
	 * @param {string} ch - 要判断的字符
	 * @returns {boolean}
	 */
	isWhitespace(ch) {
		return ch === " " || ch === "\n" || ch === "\r" || ch === "\t";
	}

	/**
	 * 判断字符是否为数字的起始字符
	 * @param {string} ch - 要判断的字符
	 * @returns {boolean}
	 */
	isNumberStart(ch) {
		return ch === "-" || (ch >= "0" && ch <= "9");
	}

	/**
	 * 判断字符是否为字母
	 * @param {string} ch - 要判断的字符
	 * @returns {boolean}
	 */
	isAlpha(ch) {
		return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
	}

	// ========== Token 读取方法 ==========
	// 这些方法负责读取特定类型的内容，并生成对应的 token

	/**
	 * 读取连续的空白字符
	 * 
	 * 为什么要保留空白符？
	 * 为了在修改 JSON 后保持原有的格式和缩进
	 */
	readWhitespace() {
		const start = this.pos;  // 记录起始位置
		// 持续读取，直到遇到非空白字符
		while (this.pos < this.text.length && this.isWhitespace(this.text[this.pos])) {
			this.pos++;
		}
		// 生成一个 whitespace 类型的 token
		this.tokens.push({
			type: "whitespace",
			start,
			end: this.pos,
		});
	}

	/**
	 * 读取字符串
	 * 
	 * 字符串规则：
	 * - 以双引号 " 开始和结束
	 * - 支持转义字符，如 \" 表示引号本身，\n 表示换行
	 * - 遇到 \ 时需要跳过下一个字符，因为它是转义序列
	 */
	readString() {
		const start = this.pos;
		this.pos++; // 跳过开头的双引号 "

		// 持续读取直到遇到结束的双引号
		while (this.pos < this.text.length) {
			const ch = this.text[this.pos];

			if (ch === "\\") {
				// 遇到转义符 \，跳过它和下一个字符
				// 例如：\" 或 \n 都占两个字符
				this.pos += 2;
				continue;
			}

			if (ch === '"') {
				// 遇到结束的双引号
				this.pos++; // 包含结束的双引号
				break;
			}

			this.pos++;
		}

		// 生成一个 string 类型的 token
		this.tokens.push({
			type: "string",
			start,
			end: this.pos,
		});
	}

	/**
	 * 读取数字
	 * 
	 * JSON 数字格式支持：
	 * 1. 整数：123
	 * 2. 负数：-123
	 * 3. 小数：123.456
	 * 4. 科学计数法：1.23e10 或 1.23E-5
	 */
	readNumber() {
		const start = this.pos;

		// 1. 处理可选的负号
		if (this.text[this.pos] === "-") this.pos++;

		// 2. 读取整数部分
		while (this.pos < this.text.length && this.isDigit(this.text[this.pos])) {
			this.pos++;
		}

		// 3. 处理可选的小数部分
		if (this.text[this.pos] === ".") {
			this.pos++;  // 跳过小数点
			// 读取小数部分的数字
			while (this.pos < this.text.length && this.isDigit(this.text[this.pos])) {
				this.pos++;
			}
		}

		// 4. 处理可选的指数部分（科学计数法）
		if (this.text[this.pos] === "e" || this.text[this.pos] === "E") {
			this.pos++;  // 跳过 e 或 E
			// 处理可选的 + 或 - 号
			if (this.text[this.pos] === "+" || this.text[this.pos] === "-") {
				this.pos++;
			}
			// 读取指数部分的数字
			while (this.pos < this.text.length && this.isDigit(this.text[this.pos])) {
				this.pos++;
			}
		}

		// 生成一个 number 类型的 token
		this.tokens.push({
			type: "number",
			start,
			end: this.pos,
		});
	}

	/**
	 * 读取关键字
	 * 
	 * JSON 只支持三个关键字：
	 * - true (布尔值真)
	 * - false (布尔值假)
	 * - null (空值)
	 */
	readKeyword() {
		const start = this.pos;

		// 读取连续的字母
		while (this.pos < this.text.length && this.isAlpha(this.text[this.pos])) {
			this.pos++;
		}

		// 提取读取到的单词
		const word = this.text.slice(start, this.pos);

		// 判断是哪个关键字
		let type;
		if (word === "true" || word === "false") {
			type = "boolean";
		} else if (word === "null") {
			type = "null";
		} else {
			// 如果不是合法的关键字，抛出错误
			throw new Error(`Unexpected identifier: ${word}`);
		}

		// 生成对应类型的 token
		this.tokens.push({
			type,
			start,
			end: this.pos,
		});
	}

	/**
	 * 读取标点符号或注释
	 * 
	 * 处理三种情况：
	 * 1. 行注释：双斜杠开头，到行末结束
	 * 2. 块注释：斜杠星号开头，星号斜杠结束
	 * 3. JSON 标点符号：左右花括号、左右方括号、冒号、逗号
	 */
	readPunctuationOrComment() {
		const start = this.pos;
		const ch = this.text[this.pos];

		// 1. 处理行注释 //
		if (ch === "/" && this.text[this.pos + 1] === "/") {
			this.pos += 2;  // 跳过 //
			// 读取到行末
			while (this.pos < this.text.length && this.text[this.pos] !== "\n") {
				this.pos++;
			}
			// 生成注释 token
			this.tokens.push({
				type: "comment",
				start,
				end: this.pos,
			});
			return;
		}

		// 2. 处理块注释 /* */
		if (ch === "/" && this.text[this.pos + 1] === "*") {
			this.pos += 2;  // 跳过 /*
			// 查找结束标记 */
			while (this.pos < this.text.length && !(this.text[this.pos] === "*" && this.text[this.pos + 1] === "/")) {
				this.pos++;
			}
			this.pos += 2; // 跳过 */
			// 生成注释 token
			this.tokens.push({
				type: "comment",
				start,
				end: this.pos,
			});
			return;
		}

		// 3. 处理标点符号
		this.pos++;  // 移动到下一个字符

		// 符号到类型的映射表
		const map = {
			"{": "braceL",     // 左花括号
			"}": "braceR",     // 右花括号
			"[": "bracketL",   // 左方括号
			"]": "bracketR",   // 右方括号
			":": "colon",      // 冒号
			",": "comma",      // 逗号
		};

		const type = map[ch];
		if (!type) {
			// 遇到不认识的字符，抛出错误
			throw new Error(`Unexpected character: ${ch} at ${start}`);
		}

		// 生成对应的标点符号 token
		this.tokens.push({
			type,
			start,
			end: this.pos,
		});
	}

	/**
	 * 判断字符是否为数字（0-9）
	 * @param {string} ch - 要判断的字符
	 * @returns {boolean}
	 */
	isDigit(ch) {
		return ch >= "0" && ch <= "9";
	}
}

export { Tokenizer };
