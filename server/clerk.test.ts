import { describe, it, expect } from "vitest";

/**
 * Validate the Clerk credentials supplied by the user by calling a
 * lightweight Clerk API endpoint with the secret key.
 */
describe("Clerk credentials", () => {
  it.skipIf(!process.env.CLERK_SECRET_KEY)(
    "Clerk secret key returns a valid API response (user list)",
    async () => {
      const res = await fetch("https://api.clerk.dev/v1/users?limit=1", {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });
      // 200 = valid credentials (may return 0 users — that's fine).
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    },
    20000
  );

  it.skipIf(!process.env.CLERK_PUBLISHABLE_KEY)(
    "Clerk publishable key has the expected format",
    () => {
      expect(process.env.CLERK_PUBLISHABLE_KEY).toMatch(/^pk_(test|live)_[A-Za-z0-9]+$/);
      expect(process.env.CLERK_SECRET_KEY).toMatch(/^sk_(test|live)_[A-Za-z0-9]+$/);
    }
  );
});
