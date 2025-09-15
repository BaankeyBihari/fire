import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const eslintConfig = [
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "dist/**",
            "coverage/**",
            "__mocks__/**",
            "*.config.js",
            "*.config.mjs",
        ],
    },
    js.configs.recommended,
    ...compat.extends(
        "next/core-web-vitals",
        "next/typescript"
    ),
    {
        rules: {
            "max-len": "off",
            "prefer-const": "error",
            "no-confusing-arrow": ["error", { "allowParens": false }],
            "no-mixed-operators": "error",
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/triple-slash-reference": "off",
        },
    },
    {
        files: ["jest.setup.js", "**/*.test.*", "**/__tests__/**/*"],
        languageOptions: {
            globals: {
                jest: "readonly",
                expect: "readonly",
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
            },
        },
    },
];

export default eslintConfig;
