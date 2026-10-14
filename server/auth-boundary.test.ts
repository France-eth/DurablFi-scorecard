import { describe, expect, it } from "vitest";

const projectUrl = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const founderEmail = process.env.DURABLFI_FOUNDER_AUTH_EMAIL;
const founderPassword = process.env.DURABLFI_FOUNDER_AUTH_PASSWORD;
const nonAdminEmail = process.env.DURABLFI_NONADMIN_AUTH_EMAIL;
const nonAdminPassword = process.env.DURABLFI_NONADMIN_AUTH_PASSWORD;
const boundaryTestConfigured = process.env.SUPABASE_RUN_LIVE_TESTS === "1" && [projectUrl, publishableKey, founderEmail, founderPassword, nonAdminEmail, nonAdminPassword].every(Boolean);

type AuthResult = { access_token: string; user: { id: string } };

async function signIn(email: string, password: string) {
  const response = await fetch(`${projectUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: publishableKey!, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  expect(response.ok, `Auth sign-in failed with status ${response.status}`).toBe(true);
  return (await response.json()) as AuthResult;
}

async function readAdminRow(accessToken: string, userId: string) {
  const response = await fetch(`${projectUrl}/rest/v1/admin_users?select=user_id&user_id=eq.${userId}`, {
    headers: { apikey: publishableKey!, Authorization: `Bearer ${accessToken}` },
  });
  expect(response.ok).toBe(true);
  return (await response.json()) as Array<{ user_id: string }>;
}

function decodeClaims(accessToken: string) {
  const payload = accessToken.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: string; role?: string; aud?: string };
}

async function publishProbe(accessToken: string) {
  const response = await fetch(`${projectUrl}/rest/v1/rpc/publish_article_version`, {
    method: "POST",
    headers: { apikey: publishableKey!, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_version_id: "00000000-0000-0000-0000-000000000000" }),
  });
  return { status: response.status, body: await response.text() };
}

describe("Supabase authenticated admin boundary", () => {
  it.skipIf(!boundaryTestConfigured)("issues valid sessions and permits only the founder allowlist row", async () => {
    const founder = await signIn(founderEmail!, founderPassword!);
    expect(founder.access_token.length).toBeGreaterThan(20);
    const founderId = founder.user.id;
    const founderClaims = decodeClaims(founder.access_token);
    expect(founderClaims.sub).toBe(founderId);
    expect(founderClaims.role).toBe("authenticated");
    expect(founderClaims.aud).toBe("authenticated");
    expect((await readAdminRow(founder.access_token, founder.user.id)).map((row) => row.user_id)).toContain(founderId);
    const founderProbe = await publishProbe(founder.access_token);
    expect(founderProbe.body).toContain("article_version_not_found");

    const nonAdmin = await signIn(nonAdminEmail!, nonAdminPassword!);
    expect(nonAdmin.access_token.length).toBeGreaterThan(20);
    expect(nonAdmin.user.id).not.toBe(founderId);
    const nonAdminClaims = decodeClaims(nonAdmin.access_token);
    expect(nonAdminClaims.sub).toBe(nonAdmin.user.id);
    expect(nonAdminClaims.role).toBe("authenticated");
    expect(await readAdminRow(nonAdmin.access_token, nonAdmin.user.id)).toEqual([]);
    const nonAdminProbe = await publishProbe(nonAdmin.access_token);
    expect(nonAdminProbe.body).toContain("publisher_admin_required");
  }, 30_000);
});
