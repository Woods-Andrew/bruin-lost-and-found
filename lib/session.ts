import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { config, isAllowedEmail, isStaffEmail } from "@/lib/config";
import { getStore } from "@/lib/store";
import { DEMO_STAFF_ID, DEMO_STUDENT_ID } from "@/lib/demo/seed";
import type { Profile, Role } from "@/lib/types";

const COOKIE = "blf_session";

type SessionPayload = {
  id: string;
  email: string;
  role: Role;
};

function sign(value: string) {
  return createHmac("sha256", config.sessionSecret).update(value).digest("hex");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Profile | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  const payload = decode(token);
  if (!payload) return null;
  const store = getStore();
  return (
    (await store.getProfile(payload.id)) ||
    (await store.getProfileByEmail(payload.email))
  );
}

export async function requireUser() {
  const user = await getSession();
  if (!user) {
    const error = new Error("Sign in required");
    (error as Error & { status: number }).status = 401;
    throw error;
  }
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "staff") {
    const error = new Error("Staff only");
    (error as Error & { status: number }).status = 403;
    throw error;
  }
  return user;
}

export async function createDemoSession(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!isAllowedEmail(normalized)) {
    throw new Error(
      `Email must use a university domain (${config.allowedEmailDomains.join(", ")})`,
    );
  }
  const store = getStore();
  const existing = await store.getProfileByEmail(normalized);
  const role: Role = isStaffEmail(normalized) ? "staff" : existing?.role || "student";
  const profile: Profile = existing
    ? { ...existing, role, emailVerified: true }
    : {
        id:
          normalized === "staff@ucla.edu"
            ? DEMO_STAFF_ID
            : crypto.randomUUID(),
        email: normalized,
        name: normalized.split("@")[0],
        role,
        emailVerified: true,
      };
  if (!existing && normalized === "bruin@ucla.edu") profile.id = DEMO_STUDENT_ID;
  await store.upsertProfile(profile);
  (await cookies()).set(COOKIE, encode({ id: profile.id, email: profile.email, role: profile.role }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return profile;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export function errorStatus(error: unknown) {
  return (error as { status?: number }).status || 400;
}
