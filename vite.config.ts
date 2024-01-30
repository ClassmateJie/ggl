import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base:  './',
  plugins: [vue()],
  server: {
    host: true
  },
  build: {
    target: 'esnext'
  }
});
