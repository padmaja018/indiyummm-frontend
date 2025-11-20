import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // makes dev server accessible on network
    port: 5173,       // optional, default is 5173
    strictPort: true, // fails if 5173 is in use
  },
});
