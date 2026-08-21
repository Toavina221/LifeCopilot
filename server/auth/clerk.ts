/**
 * Clerk authentication layer (independent of Manus hosting).
 *
 * On Vercel (or any Node host), Clerk sessions are carried in the
 * `__clerk_db_jwt` cookie. We verify them with Clerk's backend SDK,
 * map the Clerk user to our `users` table (creating/updating on each
 * request for freshness), and return the same `User | null` shape the
 * rest of the app expects.
 */
import { createClerkClient } from "@clerk/backend";
import type { ClerkClient } from "@clerk/backend";
import type { Request } from "express";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

let _clerk: ClerkClient | null = null;

export function isClerkConfigured(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY);
}

function getClerk(): ClerkClient | null {
  if (!isClerkConfigured()) return null;
  if (!_clerk) {
    try {
      _clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    } catch (error) {
      console.warn("[Clerk] Failed to initialize:", error);
      return null;
    }
  }
  return _clerk;
}

/**
 * Authenticate an incoming request using Clerk session cookies/JWT.
 * Returns the LifeCopilot `User` row (creating it on first sign-in),
 * or null if the request is not authenticated.
 */
export async function authenticateRequest(
  req: Pick<Request, "headers">
): Promise<User | null> {
  const clerk = getClerk();
  if (!clerk) return null;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers[key] = value;
    } else if (Array.isArray(value)) {
      headers[key] = value.join(", ");
    }
  }

  let clerkUserId: string | null = null;
  try {
    const requestState = await clerk.authenticateRequest({
      headers,
      method: "GET",
      url: "https://placeholder/",
    } as never);
    if (requestState.status === "signed-in") {
      // The session auth object exposes userId / sessionId; toAuth() builds it
      // from the session claims without an extra network round trip.
      const auth = requestState.toAuth();
      clerkUserId = auth.userId;
    }
  } catch (error) {
    console.warn("[Clerk] Authentication failed:", error);
    return null;
  }

  if (!clerkUserId) return null;

  let clerkUser;
  try {
    clerkUser = await clerk.users.getUser(clerkUserId);
  } catch (error) {
    console.warn("[Clerk] Failed to fetch user profile:", error);
    return null;
  }

  if (!clerkUser) return null;
  return syncUser(clerkUser);
}

async function syncUser(clerkUser: {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddressId?: string | null;
  emailAddresses?: Array<{ emailAddress: string; id: string }>;
}): Promise<User | null> {
  const nameParts = [clerkUser.firstName, clerkUser.lastName].filter(Boolean);
  const primary = clerkUser.emailAddresses?.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  );
  const email = primary?.emailAddress;

  await db.upsertUser({
    openId: `clerk:${clerkUser.id}`,
    name: nameParts.length > 0 ? nameParts.join(" ") : (clerkUser.username ?? null),
    email: email ?? null,
    loginMethod: "clerk",
  });

  const user = await db.getUserByOpenId(`clerk:${clerkUser.id}`);
  return user ?? null;
}

export type { User };
