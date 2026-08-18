import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// On GitHub Actions we build for GitHub Pages, which serves the app from
// a repo subpath (/<repo>/). Locally we keep the base at "/".
const base = process.env.GITHUB_ACTIONS
  ? '/Story-Creator-App-with-Voice-Recording-and-Sharing/'
  : '/'

export default defineConfig({
  base,
  plugins: [react()],
})
