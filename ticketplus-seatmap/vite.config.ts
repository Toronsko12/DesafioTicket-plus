import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/DesafioTicket-plus/", // Configura la base para GitHub Pages
});
