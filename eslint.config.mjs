import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat config (eslint 9). eslint-config-next 16 ships a native flat config
 * array, so it is imported directly — wrapping it in FlatCompat breaks it.
 * `next lint` was removed in Next 16, so the lint script runs eslint directly.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
