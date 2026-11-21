import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build nəticəsi birbaşa backend-in static qovluğuna yazılır (canlıda bir serverdən verilir).
// Lokal işləyəndə (npm run dev) /api sorğuları backend-ə yönləndirilir.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
