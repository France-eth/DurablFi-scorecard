-- Internal Publisher records must never be readable through the public anon role.
-- Authenticated access is privilege-granted here so RLS can distinguish the
-- founder/admin from ordinary signed-in users.
revoke all on public.scorecard_publish_checklists from anon;
revoke all on public.scorecard_review_flags from anon;
revoke all on public.publisher_activity from anon;
revoke all on public.admin_users from anon;
revoke all on public.scorecard_sources from anon;
revoke all on public.scorecard_versions from anon;
revoke all on public.article_sources from anon;
revoke all on public.article_versions from anon;

grant select, insert, update, delete on public.admin_users,
  public.scorecards, public.scorecard_versions, public.scorecard_sources,
  public.scorecard_publish_checklists, public.scorecard_review_flags,
  public.articles, public.article_versions, public.article_sources,
  public.publisher_activity to authenticated;

-- Keep the public projections as the only public content surface.
grant select on public.published_scorecards_public to anon, authenticated;
grant select on public.published_articles_public to anon, authenticated;
