import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// מספר גרסה לכל בנייה: האפליקציה בודקת אותו ומתעדכנת לבד בטלפון
const BUILD = String(Date.now())
const versionFile = {
  name: 'version-file',
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD }) }) },
}

// SINGLE=1 builds one self-contained HTML file (used for the phone preview link)
export default defineConfig({
  plugins: [react(), versionFile, ...(process.env.SINGLE ? [viteSingleFile()] : [])],
  define: { __BUILD__: JSON.stringify(BUILD) },
  base: './',
  build: { outDir: process.env.SINGLE ? 'dist-single' : 'dist' },
})
