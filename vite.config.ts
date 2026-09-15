// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pre-transform these on server start so the deep @import/svg chains
    // (open-props, index.css, isoflowIcons) aren't a cold on-demand waterfall
    // the first time the browser requests them.
    warmup: {
      clientFiles: ['./src/index.css', './src/assets/isoflowIcons.ts'],
    },
  },
})
