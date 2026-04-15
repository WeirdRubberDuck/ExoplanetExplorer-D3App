import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/api": path.resolve(__dirname, "./src/api"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/redux": path.resolve(__dirname, "./src/redux"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
    },
  },
});
