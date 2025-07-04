import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",

    setupFiles: ["./src/test/setup.ts"],

    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],

    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.nuxt/**",
      "**/cypress/**",
      "**/.nyc_output/**",
      "**/e2e/**",
    ],

    globals: true,

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/coverage/**",
        "**/.nuxt/**",
        "**/cypress/**",
        "**/.nyc_output/**",
        "**/e2e/**",
        "**/test/**",
        "**/*.d.ts",
        "**/*.config.{js,ts,mjs,mts}",
        "**/prisma/**",
        "**/public/**",
        "src/app/**/page.tsx",
        "src/app/**/layout.tsx",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    testTimeout: 10000,

    hookTimeout: 10000,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/prisma": path.resolve(__dirname, "./lib/prisma/schema"),
    },
  },

  define: {
    "process.env.NODE_ENV": '"test"',
  },
});
