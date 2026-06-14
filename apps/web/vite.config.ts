import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Slot 15: Web 5188 (CONF-10). Honra WEB_PORT.
const port = Number(process.env.WEB_PORT ?? 5188);

export default defineConfig({
  plugins: [react()],
  // .env vive na raiz do monorepo (VITE_API_BASE_URL etc.).
  envDir: '../../',
  server: { port, host: true },
  preview: { port },
});
