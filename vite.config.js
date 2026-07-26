import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FALLBACK_APP_ID = '6a2b01575fdcdc3d21540f60'

function resolveAppId() {
  if (process.env.VITE_BASE44_APP_ID) return process.env.VITE_BASE44_APP_ID
  const appJsonPath = join(__dirname, 'base44/.app.jsonc')
  if (existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(
        readFileSync(appJsonPath, 'utf8').replace(/\/\/.*$/gm, '')
      )
      if (appJson?.id) return appJson.id
    } catch {
      /* fall through */
    }
  }
  return FALLBACK_APP_ID
}

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  define: {
    'import.meta.env.VITE_BASE44_APP_ID': JSON.stringify(resolveAppId()),
  },
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: false
    }),
    react(),
  ]
});
