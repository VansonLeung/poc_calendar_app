module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    "react",
    "react-refresh"
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true }
    ]
  },
  ignorePatterns: ["dist/"],
  settings: {
    react: {
      version: "detect"
    }
  },
  overrides: [
    {
      files: ["*.config.js"],
      env: {
        node: true
      }
    }
  ]
}