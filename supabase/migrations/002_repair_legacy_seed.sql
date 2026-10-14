-- Repair for 001_durablfi_publisher.sql legacy seed linkage.
-- Safe to run repeatedly: it inserts only missing version 1 rows and re-links parents.

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

-- The projection contains only published fields, so it can safely be exposed
-- through the anon key while raw version/source tables remain revoked.
alter view public.published_scorecards_public set (security_invoker = false);
alter view public.published_articles_public set (security_invoker = false);
