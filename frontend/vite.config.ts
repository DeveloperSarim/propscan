import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/search": { target: "http://localhost:8000", timeout: 720_000 },
      "/cities": { target: "http://localhost:8000", timeout: 60_000 },
      "/areas": { target: "http://localhost:8000", timeout: 60_000 },
      "/property-types": { target: "http://localhost:8000", timeout: 60_000 },
    },
  },
});
