import { getSupabase, isSupabaseConfigured } from "../supabase/client";
import type { UserRole } from "../types";

export interface CmsUser {
  id: string;
  email: string;
  role: UserRole;
  clientId: string | null;
}

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
  if (!sb) return getDevSession();

  const { data } = await sb.auth.getSession();
  if (!data.session?.user) return null;
  return fetchProfile(data.session.user.id);
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
}

export { isSupabaseConfigured };
