// vite.config.js
import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // List your html files here, e.g:
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'src/pages/admin.html'),
        doctor: resolve(__dirname, 'src/pages/doc.html'),
        patient: resolve(__dirname, 'src/pages/patient.html'),
        //home: resolve(__dirname, 'home.html'),
      },
    },
  },
  // Public base path could be set here too:
  // base: '/~username/my-app/',
});