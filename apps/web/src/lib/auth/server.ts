import { auth } from "@clerk/nextjs/server";

import { authedApi } from "@/lib/api";
import type { ApiClient } from "@/lib/api";

/** The API client for a server component or a server action in the Studio. */
export function serverApi(): ApiClient {
  return authedApi(async () => (await auth()).getToken());
}
