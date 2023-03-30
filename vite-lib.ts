import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [glsl()],

  // library
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'webgl-fft-ocean',
    },
    copyPublicDir: true,
  },
})
