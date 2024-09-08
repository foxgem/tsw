module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "react"],
  rules: {
    // Add any custom rules here
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
