import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
    // Vite rejects requests whose Host header it does not recognise, which is
    // what blocks a tunnelled URL. A leading dot allows the domain and all its
    // subdomains, so a new ngrok URL does not need another edit.
    allowedHosts: [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.io"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
