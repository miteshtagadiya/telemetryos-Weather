import { defineConfig } from "vite";

export default defineConfig(async () => {
  const react = (await import("@vitejs/plugin-react")).default;
  const typescript = (await import("@rollup/plugin-typescript")).default;

  return {
    plugins: [typescript(), react()],
  };
});
