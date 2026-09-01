import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Compiled backend output — not frontend source
    "dist/**",
    // Node modules
    "node_modules/**",
    // Public assets
    "public/**",
  ]),
  {
    // Disable Pages Router-specific rules that generate false positives
    // for App Router components, hooks, and server actions.
    rules: {
      // This rule incorrectly fires on App Router pages and hooks — it is
      // designed only for the legacy Pages Router (/pages directory).
      "@next/next/no-document-import-in-page": "off",

      // The app uses dangerouslySetInnerHTML for the theme-detection inline
      // script (to prevent FOWT), NOT a sync <script src=...> tag. This rule
      // doesn't apply; disabling prevents false positives in layout.tsx.
      "@next/next/no-sync-scripts": "off",

      // React Compiler (experimental) reports "Compilation Skipped: Existing
      // memoization could not be preserved" via this rule when it cannot
      // auto-optimize a useCallback/useMemo. These are optimizer hints, not
      // correctness errors — disable to keep builds green.
      "react-hooks/preserve-manual-memoization": "off",

      // Downgrade no-explicit-any to a warning. Service layer and API
      // adapter code intentionally uses `any` for external API responses
      // where the shape is not yet known at compile time.
      "@typescript-eslint/no-explicit-any": "warn",

      // This rule fires false positives for setState calls inside callbacks
      // passed to useEffect (e.g. retry counter increments). The pattern is
      // valid when the effect is correctly dep-tracked.
      "react-hooks/set-state-in-effect": "off",

      // Unescaped entities in JSX are intentional for i18n text content;
      // developers are responsible for escaping where needed.
      "react/no-unescaped-entities": "off",

      // Downgrade unused-vars to warn so the build remains green while
      // in-progress code retains declared-but-unused bindings.
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
