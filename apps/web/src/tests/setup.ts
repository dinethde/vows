import { configure } from "@testing-library/react";

/** Addresses for a test run. Nothing here is secret. */
process.env.API_URL = "https://api.test.vows.lk";
process.env.NEXT_PUBLIC_SITE_URL = "https://test.vows.lk";
process.env.NEXT_PUBLIC_MEDIA_URL = "https://media.test.vows.lk";

// CI runners are slower than a laptop: an editor test once took 2.6 s to show
// a message the default one-second wait gave up on. Five seconds for every
// findBy and waitFor.
configure({ asyncUtilTimeout: 5000 });
