import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// In dev with VITE_BASE44_APP_BASE_URL set, use relative /api (Vite proxies to Base44).
// Otherwise call the platform API directly (works locally without a published app URL).
const serverUrl =
  import.meta.env.DEV && appBaseUrl ? '' : 'https://base44.app';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl: appBaseUrl ?? '',
});
