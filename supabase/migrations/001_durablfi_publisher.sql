-- DurablFi Publisher — Supabase/Postgres schema
--
-- Existing public scorecards are imported as legacy_imported=true so their approved
-- public wording and dates remain unchanged even though the original static MVP did
-- not contain all internal research fields. New drafts and updates must satisfy the
-- full publish validation implemented in the application.
--
-- Free-tier limitation (intentional): Supabase Free does not expose time-boxed
-- sessions, inactivity timeout, or single-session enforcement. Do not emulate these
-- in application code. After upgrading to Pro, enable the approved values at the
-- Supabase Auth configuration boundary: 12-hour maximum lifetime, 30-minute
-- inactivity timeout, and single-session enforcement.

create extension if not exists pgcrypto;

create type public.publisher_content_status as enum ('draft', 'needs_review', 'published', 'unpublished');
create type public.risk_tier as enum ('Low', 'Medium', 'High');
create type public.source_type as enum ('Primary', 'Independent');
create type public.review_flag_type as enum (
  'security_incident', 'stablecoin_depeg', 'dependency_incident',
  'governance_change', 'liquidity_deterioration', 'yield_mechanism_change'
);
create type public.review_flag_resolution as enum ('updated_and_published', 'no_material_change', 'unpublished');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  disabled_at timestamptz
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and disabled_at is null
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.scorecards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  protocol text not null,
  product_pool text not null default '',
  category text not null,
  chain text not null,
  status public.publisher_content_status not null default 'draft',
  publication_date timestamptz,
  last_updated timestamptz,
  published_version_id uuid,
  legacy_imported boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scorecards_published_dates check (
    status <> 'published' or publication_date is not null
  )
);

create table public.scorecard_versions (
  id uuid primary key default gen_random_uuid(),
  scorecard_id uuid not null references public.scorecards(id) on delete cascade,
  version_number integer not null,
  status public.publisher_content_status not null default 'draft',
  protocol text not null,
  product_pool text not null default '',
  slug text not null,
  category text not null,
  chain text not null,
  current_yield text not null default '',
  yield_observed_at timestamptz,
  yield_source text not null default '',
  risk_rating public.risk_tier,
  overall_risk_rationale text not null default '',
  what_could_go_wrong text not null default '',
  final_verdict text not null default '',
  smart_contract_risk_notes text not null default '',
  yield_sustainability_notes text not null default '',
  liquidity_exit_risk_notes text not null default '',
  dependency_risk_notes text not null default '',
  key_dependencies text not null default '',
  centralization_counterparty_risk_notes text not null default '',
  governance_systemic_risk_notes text not null default '',
  security_incident_history_notes text not null default '',
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scorecard_id, version_number)
);

alter table public.scorecards
  add constraint scorecards_published_version_fk
  foreign key (published_version_id) references public.scorecard_versions(id) deferrable initially deferred;

create table public.scorecard_sources (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.scorecard_versions(id) on delete cascade,
  title text not null,
  url text not null,
  source_type public.source_type not null,
  verification_note text not null default '',
  created_at timestamptz not null default now()
);

create table public.scorecard_publish_checklists (
  version_id uuid primary key references public.scorecard_versions(id) on delete cascade,
  yield_source_verified boolean not null default false,
  security_history_checked boolean not null default false,
  dependencies_identified boolean not null default false,
  liquidity_exit_assessed boolean not null default false,
  centralization_governance_assessed boolean not null default false,
  primary_source_added boolean not null default false,
  independent_override_acknowledged boolean not null default false,
  independent_override_explanation text not null default '',
  updated_at timestamptz not null default now()
);

create table public.scorecard_review_flags (
  id uuid primary key default gen_random_uuid(),
  scorecard_id uuid not null references public.scorecards(id) on delete cascade,
  flag_type public.review_flag_type not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolution public.review_flag_resolution,
  resolution_note text,
  created_by uuid references auth.users(id),
  resolved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status public.publisher_content_status not null default 'draft',
  publication_date timestamptz,
  last_updated timestamptz,
  published_version_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  version_number integer not null,
  status public.publisher_content_status not null default 'draft',
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body text not null default '',
  author_byline text not null default '',
  featured_image_url text,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, version_number)
);

alter table public.articles
  add constraint articles_published_version_fk
  foreign key (published_version_id) references public.article_versions(id) deferrable initially deferred;

create table public.article_sources (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.article_versions(id) on delete cascade,
  title text not null,
  url text not null,
  verification_note text not null default '',
  created_at timestamptz not null default now()
);

create table public.publisher_activity (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  entity_type text not null check (entity_type in ('scorecard', 'article', 'review_flag')),
  entity_id uuid not null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);

create index scorecards_public_order_idx on public.scorecards (status, publication_date desc, last_updated desc);
create index scorecard_versions_scorecard_idx on public.scorecard_versions (scorecard_id, version_number desc);
create index articles_public_order_idx on public.articles (status, publication_date desc, last_updated desc);
create index review_flags_open_idx on public.scorecard_review_flags (status, created_at desc);

alter table public.admin_users enable row level security;
alter table public.scorecards enable row level security;
alter table public.scorecard_versions enable row level security;
alter table public.scorecard_sources enable row level security;
alter table public.scorecard_publish_checklists enable row level security;
alter table public.scorecard_review_flags enable row level security;
alter table public.articles enable row level security;
alter table public.article_versions enable row level security;
alter table public.article_sources enable row level security;
alter table public.publisher_activity enable row level security;

create policy admin_users_self_read on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy admin_users_admin_read on public.admin_users for select to authenticated using (public.is_admin());
create policy admin_users_admin_write on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy scorecards_public_published_read on public.scorecards for select to anon, authenticated using (status = 'published' and published_version_id is not null);
create policy scorecards_admin_all on public.scorecards for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy scorecard_versions_public_current_read on public.scorecard_versions for select to anon, authenticated using (
  status = 'published' and exists (
    select 1 from public.scorecards s
    where s.id = scorecard_id and s.status = 'published' and s.published_version_id = id
  )
);
create policy scorecard_versions_admin_all on public.scorecard_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy scorecard_sources_admin_only on public.scorecard_sources for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy scorecard_checklists_admin_only on public.scorecard_publish_checklists for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy review_flags_admin_only on public.scorecard_review_flags for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy articles_public_published_read on public.articles for select to anon, authenticated using (status = 'published' and published_version_id is not null);
create policy articles_admin_all on public.articles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy article_versions_public_current_read on public.article_versions for select to anon, authenticated using (
  status = 'published' and exists (
    select 1 from public.articles a
    where a.id = article_id and a.status = 'published' and a.published_version_id = id
  )
);
create policy article_versions_admin_all on public.article_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy article_sources_admin_only on public.article_sources for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy activity_admin_only on public.publisher_activity for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- REST privileges are paired with the RLS policies above. Authenticated users
-- need table privileges for PostgREST to evaluate RLS; non-admins still receive
-- no internal rows because every internal policy is gated by public.is_admin().
grant select, insert, update, delete on public.admin_users, public.scorecards,
  public.scorecard_versions, public.scorecard_sources, public.scorecard_publish_checklists,
  public.scorecard_review_flags, public.articles, public.article_versions,
  public.article_sources, public.publisher_activity to authenticated;

-- Seed the three existing approved public records exactly as currently published.
-- The legacy import intentionally does not invent missing internal research notes.
with inserted as (
  insert into public.scorecards (slug, protocol, category, chain, status, publication_date, last_updated, legacy_imported)
  values
    ('aave-v3-usdc', 'Aave V3 USDC', 'Lending', 'Ethereum', 'published', '2026-09-05T00:00:00Z', '2026-09-05T00:00:00Z', true),
    ('lido-steth', 'Lido stETH', 'Liquid Staking', 'Ethereum', 'published', '2026-08-29T00:00:00Z', '2026-08-29T00:00:00Z', true),
    ('pendle-pt-eeth', 'Pendle PT-eETH', 'Yield Trading', 'Ethereum', 'published', '2026-08-22T00:00:00Z', '2026-08-22T00:00:00Z', true)
  on conflict (slug) do update set legacy_imported = true
  returning id, slug
), versions as (
  insert into public.scorecard_versions (
    scorecard_id, version_number, status, protocol, product_pool, slug, category, chain,
    current_yield, risk_rating, what_could_go_wrong, final_verdict, published_at
  )
  select i.id, 1, 'published', x.protocol, '', x.slug, x.category, 'Ethereum', x.current_yield, x.risk_rating, x.what_could_go_wrong, x.final_verdict, x.published_at
  from inserted i
  join (values
    ('aave-v3-usdc', 'Aave V3 USDC', 'Lending', '4.85%', 'Low'::public.risk_tier,
      'Aave V3 is the most battle-tested lending market in DeFi, live since 2020 across multiple market cycles and audited repeatedly. The yield here is real interest paid by borrowers, not token emissions, so it moves with demand rather than with a marketing budget.\n\nWhat could still go wrong: a sharp market crash can leave positions underwater faster than liquidators can act, which historically has produced small protocol-level bad debt. USDC itself is the second dependency — it is a centralised dollar, and Circle can freeze addresses or briefly lose its peg, as it did in March 2023. Finally, governance controls interest-rate curves and collateral settings, so a bad vote can change your risk overnight without any code being hacked.', 'A reasonable place to park stablecoins if you accept centralised-dollar risk. Low yield, low drama — that is the trade.', '2026-09-05T00:00:00Z'::timestamptz),
    ('lido-steth', 'Lido stETH', 'Liquid Staking', '3.10%', 'Low'::public.risk_tier,
      'Lido converts staked ETH into a liquid token that keeps earning consensus rewards. The underlying yield comes from Ethereum itself, which is about as durable as yield gets in this industry.\n\nWhat could still go wrong: stETH is not ETH. In a panic it has traded below ETH — roughly 7% below during the 2022 Celsius unwind — so if you are leveraged, the discount, not the protocol, is what liquidates you. Lido also concentrates a large share of all staked ETH across a curated operator set, which is a systemic and political risk more than a daily one. Slashing losses are socialised, and withdrawals can queue during heavy exits.', 'Fine as a core ETH position. Dangerous the moment you borrow against it and assume the peg holds.', '2026-08-29T00:00:00Z'::timestamptz),
    ('pendle-pt-eeth', 'Pendle PT-eETH', 'Yield Trading', '11.40%', 'Medium'::public.risk_tier,
      'Pendle splits a yield-bearing asset into principal and yield tokens. Buying the principal token at a discount gives you a fixed return if you hold to maturity — the double-digit number is a discount, not magic.\n\nWhat could still go wrong: you are stacking dependencies. Pendle contracts sit on top of an LRT, which sits on top of a restaking layer, which sits on top of Ethereum staking. Any one of those breaking hits you. Exiting before maturity means selling into AMM liquidity that can be thin, so the price you see is not always the price you get. And the headline APY quietly assumes you hold to the end and that the underlying asset does not lose value.', 'Good instrument, honest yield, but only if you actually understand you are locking capital until maturity. Not a park-and-forget position.', '2026-08-22T00:00:00Z'::timestamptz)
  ) as x(slug, protocol, category, current_yield, risk_rating, what_could_go_wrong, final_verdict, published_at) on x.slug = i.slug
  on conflict (scorecard_id, version_number) do nothing
  returning id, scorecard_id
)
update public.scorecards s
set published_version_id = v.id
from versions v
where s.id = v.scorecard_id;


-- Publish is a database operation, not merely a button state in the UI.
create or replace function public.publish_scorecard_version(
  p_version_id uuid,
  p_independent_override_explanation text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.scorecard_versions%rowtype;
  v_scorecard public.scorecards%rowtype;
  v_has_primary boolean;
  v_has_independent boolean;
  v_checklist public.scorecard_publish_checklists%rowtype;
  v_now timestamptz := now();
begin
  if not public.is_admin() then
    raise exception 'publisher_admin_required';
  end if;

  select * into v_version from public.scorecard_versions where id = p_version_id for update;
  if not found then raise exception 'scorecard_version_not_found'; end if;
  select * into v_scorecard from public.scorecards where id = v_version.scorecard_id for update;
  if not found then raise exception 'scorecard_not_found'; end if;

  if v_version.protocol = '' or v_version.product_pool = '' or v_version.slug = '' or v_version.category = '' or v_version.chain = '' then
    raise exception 'identity_fields_required';
  end if;
  if v_version.current_yield = '' or v_version.yield_observed_at is null or v_version.yield_source = '' then
    raise exception 'yield_fields_required';
  end if;
  if v_version.risk_rating is null or v_version.overall_risk_rationale = '' or v_version.what_could_go_wrong = '' or v_version.final_verdict = '' then
    raise exception 'assessment_fields_required';
  end if;
  if v_version.smart_contract_risk_notes = '' or v_version.yield_sustainability_notes = '' or v_version.liquidity_exit_risk_notes = '' or v_version.dependency_risk_notes = '' or v_version.centralization_counterparty_risk_notes = '' or v_version.governance_systemic_risk_notes = '' or v_version.security_incident_history_notes = '' then
    raise exception 'research_sections_required';
  end if;

  select exists(select 1 from public.scorecard_sources where version_id = p_version_id and source_type = 'Primary') into v_has_primary;
  select exists(select 1 from public.scorecard_sources where version_id = p_version_id and source_type = 'Independent') into v_has_independent;
  if not v_has_primary then raise exception 'primary_source_required'; end if;

  select * into v_checklist from public.scorecard_publish_checklists where version_id = p_version_id;
  if not found or not (
    v_checklist.yield_source_verified and v_checklist.security_history_checked and
    v_checklist.dependencies_identified and v_checklist.liquidity_exit_assessed and
    v_checklist.centralization_governance_assessed and v_checklist.primary_source_added
  ) then raise exception 'research_checklist_incomplete'; end if;
  if not v_has_independent then
    if not v_checklist.independent_override_acknowledged or coalesce(nullif(trim(coalesce(p_independent_override_explanation, '')), ''), '') = '' then
      raise exception 'independent_source_override_required';
    end if;
  end if;

  update public.scorecard_versions set status = 'unpublished' where scorecard_id = v_scorecard.id and status = 'published' and id <> p_version_id;
  update public.scorecard_versions set status = 'published', published_at = v_now, updated_at = v_now where id = p_version_id;
  update public.scorecards
  set status = 'published', published_version_id = p_version_id,
      publication_date = coalesce(publication_date, v_now), last_updated = v_now, updated_at = v_now
  where id = v_scorecard.id;
  insert into public.publisher_activity(actor_id, entity_type, entity_id, action) values (auth.uid(), 'scorecard', v_scorecard.id, 'published');
  return p_version_id;
end;
$$;

create or replace function public.publish_article_version(p_version_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version public.article_versions%rowtype;
  v_article public.articles%rowtype;
  v_now timestamptz := now();
begin
  if not public.is_admin() then raise exception 'publisher_admin_required'; end if;
  select * into v_version from public.article_versions where id = p_version_id for update;
  if not found then raise exception 'article_version_not_found'; end if;
  select * into v_article from public.articles where id = v_version.article_id for update;
  if not found then raise exception 'article_not_found'; end if;
  if v_version.title = '' or v_version.slug = '' or v_version.body = '' or v_version.author_byline = '' then
    raise exception 'article_required_fields_missing';
  end if;
  update public.article_versions set status = 'unpublished' where article_id = v_article.id and status = 'published' and id <> p_version_id;
  update public.article_versions set status = 'published', published_at = v_now, updated_at = v_now where id = p_version_id;
  update public.articles
  set status = 'published', published_version_id = p_version_id,
      publication_date = coalesce(publication_date, v_now), last_updated = v_now, updated_at = v_now
  where id = v_article.id;
  insert into public.publisher_activity(actor_id, entity_type, entity_id, action) values (auth.uid(), 'article', v_article.id, 'published');
  return p_version_id;
end;
$$;

grant execute on function public.publish_scorecard_version(uuid, text) to authenticated;
grant execute on function public.publish_article_version(uuid) to authenticated;


-- Public projections deliberately omit internal research sections and all sources.
-- Public clients must use these projections rather than selecting raw version rows.
create or replace view public.published_scorecards_public
with (security_invoker = true)
as
select
  s.id, s.slug, s.protocol, v.product_pool, s.category, s.chain,
  v.current_yield, v.yield_observed_at, v.risk_rating,
  v.overall_risk_rationale, v.what_could_go_wrong, v.final_verdict,
  s.publication_date, s.last_updated
from public.scorecards s
join public.scorecard_versions v on v.id = s.published_version_id
where s.status = 'published' and v.status = 'published';

grant select on public.published_scorecards_public to anon, authenticated;
revoke select on public.scorecard_versions from anon, authenticated;
revoke select on public.scorecard_sources from anon, authenticated;

create or replace view public.published_articles_public
with (security_invoker = true)
as
select
  a.id, a.slug, v.title, v.excerpt, v.body, v.author_byline,
  v.featured_image_url, a.publication_date, a.last_updated
from public.articles a
join public.article_versions v on v.id = a.published_version_id
where a.status = 'published' and v.status = 'published';

grant select on public.published_articles_public to anon, authenticated;
revoke select on public.article_versions from anon, authenticated;
revoke select on public.article_sources from anon, authenticated;


-- Fresh-install safety repair: the legacy seed must always link each parent to
-- its immutable published version before public RLS can expose the record.
with legacy(slug, protocol, category, current_yield, risk_rating, what_could_go_wrong, final_verdict, published_at) as (
  values
    ('aave-v3-usdc', 'Aave V3 USDC', 'Lending', '4.85%', 'Low'::public.risk_tier,
      'Aave V3 is the most battle-tested lending market in DeFi, live since 2020 across multiple market cycles and audited repeatedly. The yield here is real interest paid by borrowers, not token emissions, so it moves with demand rather than with a marketing budget.\n\nWhat could still go wrong: a sharp market crash can leave positions underwater faster than liquidators can act, which historically has produced small protocol-level bad debt. USDC itself is the second dependency — it is a centralised dollar, and Circle can freeze addresses or briefly lose its peg, as it did in March 2023. Finally, governance controls interest-rate curves and collateral settings, so a bad vote can change your risk overnight without any code being hacked.', 'A reasonable place to park stablecoins if you accept centralised-dollar risk. Low yield, low drama — that is the trade.', '2026-09-05T00:00:00Z'::timestamptz),
    ('lido-steth', 'Lido stETH', 'Liquid Staking', '3.10%', 'Low'::public.risk_tier,
      'Lido converts staked ETH into a liquid token that keeps earning consensus rewards. The underlying yield comes from Ethereum itself, which is about as durable as yield gets in this industry.\n\nWhat could still go wrong: stETH is not ETH. In a panic it has traded below ETH — roughly 7% below during the 2022 Celsius unwind — so if you are leveraged, the discount, not the protocol, is what liquidates you. Lido also concentrates a large share of all staked ETH across a curated operator set, which is a systemic and political risk more than a daily one. Slashing losses are socialised, and withdrawals can queue during heavy exits.', 'Fine as a core ETH position. Dangerous the moment you borrow against it and assume the peg holds.', '2026-08-29T00:00:00Z'::timestamptz),
    ('pendle-pt-eeth', 'Pendle PT-eETH', 'Yield Trading', '11.40%', 'Medium'::public.risk_tier,
      'Pendle splits a yield-bearing asset into principal and yield tokens. Buying the principal token at a discount gives you a fixed return if you hold to maturity — the double-digit number is a discount, not magic.\n\nWhat could still go wrong: you are stacking dependencies. Pendle contracts sit on top of an LRT, which sits on top of a restaking layer, which sits on top of Ethereum staking. Any one of those breaking hits you. Exiting before maturity means selling into AMM liquidity that can be thin, so the price you see is not always the price you get. And the headline APY quietly assumes you hold to the end and that the underlying asset does not lose value.', 'Good instrument, honest yield, but only if you actually understand you are locking capital until maturity. Not a park-and-forget position.', '2026-08-22T00:00:00Z'::timestamptz)
)
insert into public.scorecard_versions (
  scorecard_id, version_number, status, protocol, product_pool, slug, category, chain,
  current_yield, risk_rating, what_could_go_wrong, final_verdict, published_at
)
select s.id, 1, 'published', l.protocol, '', l.slug, l.category, 'Ethereum', l.current_yield,
       l.risk_rating, l.what_could_go_wrong, l.final_verdict, l.published_at
from public.scorecards s
join legacy l on l.slug = s.slug
where not exists (
  select 1 from public.scorecard_versions v
  where v.scorecard_id = s.id and v.version_number = 1
);

update public.scorecards s
set published_version_id = v.id
from public.scorecard_versions v
where v.scorecard_id = s.id
  and v.version_number = 1
  and s.slug in ('aave-v3-usdc', 'lido-steth', 'pendle-pt-eeth');

alter view public.published_scorecards_public set (security_invoker = false);
alter view public.published_articles_public set (security_invoker = false);


-- Defense in depth: internal Publisher records are never public REST surfaces.
revoke all on public.scorecard_publish_checklists from anon, authenticated;
revoke all on public.scorecard_review_flags from anon, authenticated;
revoke all on public.publisher_activity from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
revoke all on public.scorecard_sources from anon, authenticated;
revoke all on public.scorecard_versions from anon, authenticated;
revoke all on public.article_sources from anon, authenticated;
revoke all on public.article_versions from anon, authenticated;
grant select on public.published_scorecards_public to anon, authenticated;
grant select on public.published_articles_public to anon, authenticated;
