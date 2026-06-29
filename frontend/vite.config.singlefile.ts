import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Produces a single self-contained dist/index.html (all JS + CSS inlined) that
// runs by double-clicking — no dev server / localhost needed.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: "dist-single" },
});
