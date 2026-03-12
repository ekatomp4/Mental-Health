import js from "@eslint/js";

export default [
	js.configs.recommended,

	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				console: "readonly",
				process: "readonly",
				module: "readonly",
				require: "readonly",
				__dirname: "readonly"
			}
		},

		rules: {
			"no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"no-undef": "error",

			eqeqeq: ["error", "always"],
			curly: ["error", "all"],
			"no-console": "off",

			semi: ["error", "always"],
			quotes: ["error", "double"],
			indent: ["error", "tab"],
			"comma-dangle": ["error", "never"],
			"object-curly-spacing": ["error", "always"],

			"prefer-const": "error",
			"no-var": "error",
			"arrow-body-style": ["error", "as-needed"]
		}
	}
];
