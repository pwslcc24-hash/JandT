import { getSupabase, isSupabaseConfigured } from "../supabase/client";
import type { UserRole } from "../types";

export interface CmsUser {
  id: string;
  email: string;
  role: UserRole;
  clientId: string | null;
}

const STUDIO_UNLOCK_KEY = "cms_studio_unlock";
const STUDIO_PIN = import.meta.env.VITE_STUDIO_PIN ?? "3690";

export async function signIn(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const profile = await fetchProfile(data.user.id);
  return { user: data.user, profile };
}

export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function fetchProfile(userId: string): Promise<CmsUser | null> {
  const sb = getSupabase();
  if (!sb) return getDevAdmin(userId);

  const { data } = await sb
    .from("profiles")
    .select("id, email, role, client_id")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    email: data.email ?? "",
    role: data.role as UserRole,
    clientId: data.client_id,
  };
}

export async function getSessionUser(): Promise<CmsUser | null> {
  const sb = getSupabase();
  if (!sb) return getPinSession() ?? getDevSession();

  const { data } = await sb.auth.getSession();
  if (!data.session?.user) return getPinSession();
  return fetchProfile(data.session.user.id);
}

function createStudioUser(): CmsUser {
  return {
    id: "studio-owner",
    email: "owner@studio.local",
    role: "admin",
    clientId: "local-holdsworth",
  };
}

export function getPinSession(): CmsUser | null {
  const raw = localStorage.getItem(STUDIO_UNLOCK_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CmsUser;
  } catch {
    return null;
  }
}

export function unlockWithPin(pin: string): CmsUser | null {
  if (pin !== STUDIO_PIN) return null;
  const user = createStudioUser();
  localStorage.setItem(STUDIO_UNLOCK_KEY, JSON.stringify(user));
  return user;
}

export function clearPinSession() {
  localStorage.removeItem(STUDIO_UNLOCK_KEY);
}

/** Dev mode: allow admin without Supabase */
function getDevSession(): CmsUser | null {
  if (!import.meta.env.DEV) return null;
  const raw = localStorage.getItem("cms_dev_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CmsUser;
  } catch {
    return null;
  }
}

function getDevAdmin(userId: string): CmsUser {
  return {
    id: userId,
    email: "dev@local",
    role: "admin",
    clientId: "local-holdsworth",
  };
}

export function devSignInAsAdmin() {
  const user: CmsUser = {
    id: "dev-admin",
    email: "admin@holdsworth.local",
    role: "admin",
    clientId: "local-holdsworth",
  };
  localStorage.setItem("cms_dev_user", JSON.stringify(user));
  return user;
}

export function devSignOut() {
  localStorage.removeItem("cms_dev_user");
  clearPinSession();
}

export { isSupabaseConfigured };
