import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Next.js 推奨設定
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "off",
      "@next/next/no-sync-scripts": "error",
      
      // TypeScript 推奨設定
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      
      // React 推奨設定
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // 一般的なコード品質
      "no-console": "off",
      "no-debugger": "error",
      "no-unused-vars": "off", // TypeScript版を使用
      "prefer-const": "off",
      "no-var": "error",
      
      // インポート順序
      "import/order": "off"
    }
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  }
];

export default eslintConfig;