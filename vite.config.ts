import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Keep the same React build available to the browser and Android WebView.
export default defineConfig({ plugins: [react()] });
