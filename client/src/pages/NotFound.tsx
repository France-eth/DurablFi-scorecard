import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return <div className="page-shell"><section className="page-hero shell"><p className="eyebrow eyebrow-accent"><span className="eyebrow-line" aria-hidden="true" />Not found</p><h1>This page is<br /><em>not on the record.</em></h1><p>Try the free scorecard library or return to the DurablFi home page.</p><div className="hero-actions"><Link href="/scorecards" className="button button-primary">View scorecards <ArrowLeft size={16} /></Link><Link href="/" className="text-link">Back home <span aria-hidden="true">↗</span></Link></div></section></div>;
}
