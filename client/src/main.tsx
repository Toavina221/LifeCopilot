import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { registerClerkOpenSignIn, startLogin } from "@/lib/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink, TRPCClientError } from "@trpc/client";
import { ClerkProvider, useClerk } from "@clerk/clerk-react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: "/api/trpc",
      headers() {
        // Preview auto-login fallback (Manus dev hosting): when the browser
        // blocks iframe cookies (Safari ITP / private browsing / WebView), the
        // runtime mirrors the session into sessionStorage so we can forward it
        // as a Bearer token. The regular cookie flow (Manus OAuth or Clerk)
        // keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

/**
 * Clerk bootstrap: when a publishable key is configured we wrap the app in
 * ClerkProvider and register the `openSignIn` helper so `startLogin()` calls
 * (used by legacy button handlers across the app) open the Clerk modal.
 * Without a key, the app keeps working with Manus OAuth untouched.
 */
function ClerkBootstrap({ children }: { children: React.ReactNode }) {
  const clerk = useClerk();
  // Clerk sessions self-refresh; sign out on the server (clears our cookie)
  // right after Clerk signs the session out on the client side.
  void clerk;
  return <>{children}</>;
}

function ClerkShell({ children }: { children: React.ReactNode }) {
  const clerk = useClerk();
  registerClerkOpenSignIn(() => clerk.openSignIn());
  return <ClerkBootstrap>{children}</ClerkBootstrap>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return <>{children}</>;
  }
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        variables: { colorPrimary: "#0f766e" },
      }}
    >
      <ClerkShell>{children}</ClerkShell>
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <Shell>
        <App />
      </Shell>
    </QueryClientProvider>
  </trpc.Provider>
);
