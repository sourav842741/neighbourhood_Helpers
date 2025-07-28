import path from 'path'; // 👈 Required
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 👈 Use alias like "@/components/..."
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
