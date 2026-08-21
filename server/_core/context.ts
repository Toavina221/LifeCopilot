import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateRequest as authenticateWithClerk } from "../auth/clerk";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Prefer Clerk when configured (Vercel / standalone hosting).
    user = await authenticateWithClerk(opts.req);

    // Fall back to the Manus OAuth SDK only if OAUTH_SERVER_URL is present.
    if (!user && ENV.oAuthServerUrl) {
      const { sdk } = await import("./sdk");
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
