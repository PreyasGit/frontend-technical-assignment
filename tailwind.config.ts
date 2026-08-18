import type { Config } from "tailwindcss";

/*
 * Tailwind CSS v4 is configured through CSS (`src/app/globals.css`), where the
 * design tokens live inside the `@theme inline` block. This file only declares
 * the content sources for tooling that still reads a JS config.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/config/**/*.{ts,tsx}",
  ],
};

export default config;
