import { createApiClient } from "./client";
import type { ApiClient } from "./client";
import type { TokenGetter } from "./transport";

export { ApiError } from "./errors";
export type { ApiClient } from "./client";

/** Public reads from a server component: no token, so Next may keep the reply until a rebuild. */
export const publicApi = (): ApiClient => createApiClient();

/** Studio calls. The caller says where the token comes from; that is the only difference. */
export const authedApi = (getToken: TokenGetter): ApiClient => createApiClient(getToken);
