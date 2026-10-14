export type RiskTier = "Low" | "Medium" | "High";

export type ScorecardVersion = { date: string; label: string };

export type Scorecard = {
  slug: string;
  label: string;
  protocolName: string;
  category: string;
  chain: string;
  currentYield: string;
  riskTier: RiskTier;
  whatCouldGoWrong: string[];
  plainEnglishVerdict: string;
  datePublished: string;
  dateUpdated: string;
  versionHistory?: ScorecardVersion[];
  note?: string;
};

export const scorecards: Scorecard[] = [
  { slug: "aave-v3-usdc", label: "Research record", protocolName: "Aave V3 USDC", category: "Lending", chain: "Ethereum", currentYield: "4.85%", riskTier: "Low", whatCouldGoWrong: ["Aave V3 is the most battle-tested lending market in DeFi, live since 2020 across multiple market cycles and audited repeatedly. The yield here is real interest paid by borrowers, not token emissions, so it moves with demand rather than with a marketing budget.", "What could still go wrong: a sharp market crash can leave positions underwater faster than liquidators can act, which historically has produced small protocol-level bad debt. USDC itself is the second dependency — it is a centralised dollar, and Circle can freeze addresses or briefly lose its peg, as it did in March 2023. Finally, governance controls interest-rate curves and collateral settings, so a bad vote can change your risk overnight without any code being hacked."], plainEnglishVerdict: "A reasonable place to park stablecoins if you accept centralised-dollar risk. Low yield, low drama — that is the trade.", datePublished: "September 5, 2026", dateUpdated: "September 5, 2026" },
  { slug: "lido-steth", label: "Research record", protocolName: "Lido stETH", category: "Liquid Staking", chain: "Ethereum", currentYield: "3.10%", riskTier: "Low", whatCouldGoWrong: ["Lido converts staked ETH into a liquid token that keeps earning consensus rewards. The underlying yield comes from Ethereum itself, which is about as durable as yield gets in this industry.", "What could still go wrong: stETH is not ETH. In a panic it has traded below ETH — roughly 7% below during the 2022 Celsius unwind — so if you are leveraged, the discount, not the protocol, is what liquidates you. Lido also concentrates a large share of all staked ETH across a curated operator set, which is a systemic and political risk more than a daily one. Slashing losses are socialised, and withdrawals can queue during heavy exits."], plainEnglishVerdict: "Fine as a core ETH position. Dangerous the moment you borrow against it and assume the peg holds.", datePublished: "August 29, 2026", dateUpdated: "August 29, 2026", note: "Yield shown is the figure observed when this scorecard was written. Educational research only — not financial advice." },
  { slug: "pendle-pt-eeth", label: "Research record", protocolName: "Pendle PT-eETH", category: "Yield Trading", chain: "Ethereum", currentYield: "11.40%", riskTier: "Medium", whatCouldGoWrong: ["Pendle splits a yield-bearing asset into principal and yield tokens. Buying the principal token at a discount gives you a fixed return if you hold to maturity — the double-digit number is a discount, not magic.", "What could still go wrong: you are stacking dependencies. Pendle contracts sit on top of an LRT, which sits on top of a restaking layer, which sits on top of Ethereum staking. Any one of those breaking hits you. Exiting before maturity means selling into AMM liquidity that can be thin, so the price you see is not always the price you get. And the headline APY quietly assumes you hold to the end and that the underlying asset does not lose value."], plainEnglishVerdict: "Good instrument, honest yield, but only if you actually understand you are locking capital until maturity. Not a park-and-forget position.", datePublished: "August 22, 2026", dateUpdated: "August 22, 2026", note: "Yield shown is the figure observed when this scorecard was written. Educational research only — not financial advice." },
];

export const riskTierLegend: Array<{ name: RiskTier; tone: string; description: string }> = [
  { name: "Low", tone: "low", description: "Lower observed risk, with caveats explained in the write-up." },
  { name: "Medium", tone: "medium", description: "Material risk factors require careful review before depositing." },
  { name: "High", tone: "high", description: "Significant failure paths make capital preservation uncertain." },
];

export function getScorecardLatestDate(scorecard: Scorecard) { return scorecard.dateUpdated || scorecard.datePublished; }
export function getScorecard(slug: string | undefined) { return scorecards.find((scorecard) => scorecard.slug === slug); }
