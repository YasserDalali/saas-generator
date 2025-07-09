import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

// Helper to convert all rules to "warn"
function warnify(config) {
  const newConfig = { ...config };
  if (newConfig.rules) {
    newConfig.rules = Object.fromEntries(
      Object.entries(newConfig.rules).map(([rule, setting]) => {
        if (setting === "off" || setting === 0) return [rule, "off"];
        if (setting === "warn" || setting === 1) return [rule, "warn"];
        if (Array.isArray(setting)) {
          return [rule, ["warn", ...setting.slice(1)]];
        }
        return [rule, "warn"];
      })
    );
  }
  return newConfig;
}

export default [
  warnify(js.configs.recommended),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.node
    }
  },
  ...tseslint.configs.recommended.map(warnify),
  // JSON files are ignored
  {
    files: ["**/*.json"],
    ignores: ["**/*.json"]
  }
];
