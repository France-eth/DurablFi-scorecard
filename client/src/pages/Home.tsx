import { ArrowRight, BookOpen, ChevronDown, ShieldCheck, Waypoints } from "lucide-react";
import { Link } from "wouter";
import EmailCapture from "@/components/EmailCapture";
import FAQ from "@/components/FAQ";
import ScorecardCard from "@/components/ScorecardCard";
import { riskTierLegend, scorecards } from "@/data/scorecards";

export default function Home() {
  return <>
    <section className="hero-section hero-live-section">
      <div className="hero-live-glow" aria-hidden="true" />
      <div className="shell hero-grid">
        <div className="hero-copy hero-live-copy">
          <p className="eyebrow eyebrow-accent"><span className="eyebrow-line" aria-hidden="true" />Independent DeFi research</p>
          <h1>Understand the <em>risk</em> before it moves.</h1>
          <p className="hero-lede">DurablFi publishes clear, hand-written risk &amp; yield scorecards for DeFi pools and protocols — so you can understand what you are taking on before depositing capital.</p>
          <div className="hero-actions"><Link href="/scorecards" className="button button-primary">Read free scorecards <ArrowRight size={16} strokeWidth={1.8} /></Link><Link href="/archive" className="text-link">Open the free library <span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className="hero-aside hero-live-aside" aria-label="Current research records">
          <div className="live-orbital-field" aria-hidden="true"><div className="live-orbit live-orbit-a" /><div className="live-orbit live-orbit-b" /><span className="live-orbit-node live-node-a" /><span className="live-orbit-node live-node-b" /><span className="live-orbit-node live-node-c" /></div>
          <div className="hero-live-card"><div className="hero-live-card-top"><span className="eyebrow">Research library</span><span className="live-indicator"><i aria-hidden="true" /> Published</span></div><strong>Three records.<br /><span>Many failure paths.</span></strong><div className="hero-live-card-list">{scorecards.map((scorecard) => <Link key={scorecard.slug} href={`/scorecards/${scorecard.slug}`}><span>{scorecard.protocolName}</span><b>{scorecard.currentYield}</b><small>{scorecard.riskTier} risk</small></Link>)}</div></div>
        </div>
      </div>
      <div className="shell hero-footnote"><span>Research</span><span>not recommendations</span><span className="hero-footnote-rule" aria-hidden="true" /><span>Scroll to explore</span><ChevronDown size={14} aria-hidden="true" /></div>
    </section>
    <section className="section section-intro living-intro"><div className="shell intro-grid"><p className="section-index">Why DurablFi</p><div className="intro-content"><h2>Yield is a headline.<br /><span>Risk is the story.</span></h2><p>DeFi makes it easy to see what a pool promises. It is harder to see where that promise comes from, what could break it, and whether the risk is worth carrying.</p><p>DurablFi turns those questions into a readable editorial record — one scorecard at a time.</p><div className="intro-principles"><div><ShieldCheck size={18} strokeWidth={1.5} /><span>Human-led<br />research</span></div><div><Waypoints size={18} strokeWidth={1.5} /><span>Failure paths<br />made visible</span></div><div><BookOpen size={18} strokeWidth={1.5} /><span>Plain-English<br />verdicts</span></div></div></div></div></section>
    <section className="section scorecard-preview-section living-records"><div className="shell"><div className="section-heading-row"><div><p className="section-index">Free scorecards</p><h2>Read the record.</h2></div><Link href="/scorecards" className="text-link">View all scorecards <span aria-hidden="true">↗</span></Link></div><div className="scorecard-grid">{scorecards.map((scorecard) => <ScorecardCard key={scorecard.slug} scorecard={scorecard} />)}</div><div className="risk-legend"><p className="eyebrow">Risk tiers</p>{riskTierLegend.map((tier) => <div className="legend-item" key={tier.name}><span className={`risk-dot ${tier.tone}`} aria-hidden="true" /><strong>{tier.name}</strong><span>{tier.description}</span></div>)}</div></div></section>
    <section className="section archive-callout-section living-cta"><div className="shell archive-callout"><div><p className="section-index">The scorecard library</p><h2>More research,<br /><span>free to read.</span></h2></div><div className="archive-callout-copy"><p>The DurablFi Scorecard Library keeps every published record in one public place. Browse the research by protocol, category, chain, risk tier, or yield.</p><Link href="/archive" className="button button-secondary">Open the free library <ArrowRight size={16} strokeWidth={1.8} /></Link></div><span className="archive-mark" aria-hidden="true">∴</span></div></section>
    <FAQ /><div className="shell home-email-wrap"><EmailCapture /></div>
  </>;
}
