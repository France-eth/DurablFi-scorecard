import { describe, expect, it } from "vitest";

describe("secure GitHub push credential validation", () => {
  it("can read the target repository and has push permission", async () => {
    const token = process.env.GITHUB_PUSH_TOKEN;
    expect(token, "GITHUB_PUSH_TOKEN is required").toBeTruthy();

    const response = await fetch("https://api.github.com/repos/France-eth/DurablFi-scorecard", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    expect(response.ok).toBe(true);

    const repository = (await response.json()) as {
      full_name?: string;
      permissions?: { push?: boolean };
    };
    expect(repository.full_name?.toLowerCase()).toBe("france-eth/durablfi-scorecard");
    expect(repository.permissions?.push).toBe(true);

  }, 30_000);
});
