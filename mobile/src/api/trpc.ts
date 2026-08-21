import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";
import { API_URL } from "../lib/theme";
import type { AppRouter } from "../../../shared/routers";

export const trpc = createTRPCReact<AppRouter>();

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function getAuthToken() {
  return authToken;
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_URL}/api/trpc`,
      transformer: superjson,
      headers() {
        const headers: Record<string, string> = {};
        const token = getAuthToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
      },
    }),
  ],
});
