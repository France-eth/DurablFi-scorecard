import { describe, expect, it } from "vitest";

describe("secure Supabase publishable configuration", () => {
  it.skipIf(process.env.SUPABASE_RUN_LIVE_TESTS !== "1" || !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY)("reads the public scorecard projection from the configured project", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    expect(url, "VITE_SUPABASE_URL is required").toBeTruthy();
    expect(key, "VITE_SUPABASE_PUBLISHABLE_KEY is required").toBeTruthy();
    expect(new URL(url!).hostname).toMatch(/^[a-z0-9-]+\.supabase\.co$/);

    const response = await fetch(`${url}/rest/v1/published_scorecards_public?select=slug&limit=1`, {
      headers: { apikey: key!, Authorization: `Bearer ${key}` },
    });
    expect(response.ok).toBe(true);
    const rows = (await response.json()) as Array<{ slug?: string }>;
    expect(Array.isArray(rows)).toBe(true);

    const articlesResponse = await fetch(`${url}/rest/v1/published_articles_public?select=slug&limit=1`, {
      headers: { apikey: key!, Authorization: `Bearer ${key}` },
    });
    expect(articlesResponse.ok).toBe(true);
    const articles = (await articlesResponse.json()) as Array<{ slug?: string }>;
    expect(Array.isArray(articles)).toBe(true);
  }, 30_000);
});
