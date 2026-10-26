import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";

import type { Db } from "@vows/db";

import { AppModule } from "../src/app.module";
import { configure } from "../src/bootstrap";
import { JWKS } from "../src/common/guards/clerk.guard";
import { DB } from "../src/database/database.module";

export interface Harness {
  app: INestApplication;
  db: Db;
  /** A token Clerk would have issued. Override a claim to test a refusal. */
  token: (role: string | null, claims?: Record<string, unknown>) => Promise<string>;
}

/** The real application with one swap: the signing keys are made here, not fetched from Clerk. */
export async function startApp(): Promise<Harness> {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = { ...(await exportJWK(publicKey)), kid: "test-key", alg: "RS256" };

  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(JWKS)
    .useValue(createLocalJWKSet({ keys: [jwk] }))
    .compile();
  const app = module.createNestApplication();
  await configure(app);
  await app.init();

  const token: Harness["token"] = (role, claims = {}) =>
    new SignJWT({
      azp: "http://localhost:3000",
      ...(role ? { public_metadata: { role } } : {}),
      ...claims,
    })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setSubject("user_test")
      .setIssuer(process.env.CLERK_ISSUER ?? "")
      .setIssuedAt()
      .setExpirationTime("2m")
      .sign(privateKey);

  return { app, db: app.get<Db>(DB), token };
}

/** These tests write to a real Postgres, so they need a branch to write to. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);
