import { describe, expect, it } from "vitest";

describe("secure Supabase credential validation", () => {
  it.skipIf(process.env.SUPABASE_RUN_LIVE_TESTS !== "1" || !process.env.SUPABASE_ACCESS_TOKEN_REPLACEMENT)("accepts the replacement management token for the target project", async () => {
    const token = process.env.SUPABASE_ACCESS_TOKEN_REPLACEMENT;
    const configuredUrl = process.env.VITE_SUPABASE_URL;
    const projectRef = process.env.SUPABASE_PROJECT_REF ?? (configuredUrl ? new URL(configuredUrl).hostname.split(".")[0] : undefined);
    expect(token, "SUPABASE_ACCESS_TOKEN_REPLACEMENT is required").toBeTruthy();
    expect(projectRef, "SUPABASE_PROJECT_REF is required").toBeTruthy();

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok).toBe(true);
    const project = (await response.json()) as { id?: string; ref?: string };
    expect(project.ref === projectRef || project.id === projectRef).toBe(true);
  }, 30_000);
});
