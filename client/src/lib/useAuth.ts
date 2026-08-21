/**
 * Unified auth hook used across the app.
 *
 * - When Clerk is configured (`VITE_CLERK_PUBLISHABLE_KEY`), it uses Clerk
 *   sessions and keeps the dashboard/profile data in sync with our own
 *   `users` table via `auth.me` (which upserts the Clerk user server-side).
 * - When Clerk is NOT configured (default Manus hosting), it falls back to
 *   the legacy Manus OAuth behaviour so nothing breaks.
 *
 * Contract (same as the legacy useAuth hook):
 *   { user, loading, error, isAuthenticated, refresh(), logout(), startLogin() }
 */
import { startLogin as startManusLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import type { User } from "@shared/types";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useCallback, useMemo } from "react";

type UseAuthState = {
  user: User | null;
  loading: boolean;
  error: unknown;
  isAuthenticated: boolean;
  refresh: () => void;
  logout: () => Promise<void>;
  startLogin: () => void;
  signIn: () => void;
};

function useClerkAuth(): UseAuthState | null {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return null;

  const clerk = useClerk();
  const { user: clerkUser, isLoaded } = useUser();
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Only query our user row when Clerk reports a signed-in session,
    // otherwise `me` resolves to null immediately.
    enabled: isLoaded && Boolean(clerkUser),
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await clerk.signOut();
    } catch {}
    try {
      await logoutMutation.mutateAsync();
    } catch {}
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [clerk, logoutMutation, utils]);

  const startLogin = useCallback(() => {
    clerk.openSignIn();
  }, [clerk]);

  const state = useMemo<UseAuthState>(
    () => ({
      user: (meQuery.data as User | null) ?? null,
      loading:
        !isLoaded ||
        meQuery.isLoading ||
        (Boolean(clerkUser) && meQuery.isRefetching && !meQuery.data),
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: isLoaded && Boolean(clerkUser),
      refresh: () => {
        void meQuery.refetch();
      },
      logout,
      startLogin,
      signIn: () => clerk.openSignIn(),
    }),
    [
      isLoaded,
      clerkUser,
      meQuery,
      logoutMutation.error,
      logoutMutation.isPending,
      logout,
      startLogin,
      clerk,
    ]
  );

  return state;
}

export function useAuth(): UseAuthState {
  const clerkState = useClerkAuth();
  if (clerkState) return clerkState;

  // Legacy Manus OAuth fallback: import dynamically to avoid bundling Clerk
  // hooks when Clerk is not configured (ClerkProvider would not be present).
  // We keep the same contract by delegating to the legacy hook implementation.
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // already logged out
    } finally {
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  // The server now returns plain JSON (no superjson transformer), so
  // timestamp columns arrive as ISO strings. Rehydrate them into Date
  // objects to keep the legacy User contract.
  const meData = useMemo(() => {
    const raw = meQuery.data;
    if (!raw) return raw;
    return {
      ...raw,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      lastSignedIn: new Date(raw.lastSignedIn),
    };
  }, [meQuery.data]);

  return useMemo(
    () => ({
      user: meData ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
      refresh: () => void meQuery.refetch(),
      logout,
      startLogin: () => startManusLogin(),
      signIn: () => startManusLogin(),
    }),
    [meData, logoutMutation, logout]
  );
}

/**
 * Module-level reference to the Clerk singleton, set once by the Clerk
 * provider wrapper in `main.tsx` (before any button calls `startLogin`).
 */
let _clerkOpenSignIn: (() => void) | null = null;

/**
 * Registers the Clerk openSignIn helper (called once by the Clerk provider
 * wrapper in `main.tsx`). Safe to call multiple times.
 */
export const registerClerkOpenSignIn = (openSignIn: () => void) => {
  _clerkOpenSignIn = openSignIn;
};

/**
 * Standalone helper that triggers the login flow (modal for Clerk, redirect
 * for the legacy Manus OAuth). Used from components that only need a click
 * handler without pulling the full `useAuth` hook.
 */
export const startLogin = () => {
  if (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && _clerkOpenSignIn) {
    _clerkOpenSignIn();
    return;
  }
  startManusLogin();
};
