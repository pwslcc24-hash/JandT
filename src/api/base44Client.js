import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

function resolveServerUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('.base44.app') || (import.meta.env.DEV && appBaseUrl)) {
      return '';
    }
  }
  return 'https://base44.app';
}

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: resolveServerUrl(),
  requiresAuth: false,
  appBaseUrl: appBaseUrl ?? '',
});
