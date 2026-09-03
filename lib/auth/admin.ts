import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signValue, verifySignedValue } from "@/lib/security";

const ADMIN_COOKIE = "goat_admin";

export async function createAdminSession() {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12;
  const store = await cookies();
  store.set(ADMIN_COOKIE, signValue(String(expiresAt)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function isAdmin() {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const expiresAt = verifySignedValue(value);
  return Boolean(expiresAt && Number(expiresAt) > Date.now());
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
