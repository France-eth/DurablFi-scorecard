import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, Loader2, Pencil, Send } from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { getPublishChecklist, getScorecardSources, getScorecardVersion, friendlyPublisherError, publishScorecardVersion, type ScorecardVersion } from "@/lib/publisher";

export default function PublisherScorecardPreview() {
  const [, params] = useRoute("/publisher/scorecards/:versionId/preview");
  const [, navigate] = useLocation();
  const [version, setVersion] = useState<ScorecardVersion | null>(null);
  const [sources, setSources] = useState<Array<{ title: string; source_type: string }>>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean | string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);
  const versionId = params?.versionId;

  useEffect(() => { if (!versionId) return; let active = true; Promise.all([getScorecardVersion(versionId), getScorecardSources(versionId), getPublishChecklist(versionId)]).then(([loaded, loadedSources, loadedChecklist]) => { if (!active) return; setVersion(loaded); setSources(loadedSources); setChecklist(loadedChecklist); }).catch((cause) => setError(friendlyPublisherError(cause))).finally(() => active && setLoading(false)); return () => { active = false; }; }, [versionId]);
  async function publish() { if (!versionId || !window.confirm("Publish this scorecard version? The previous published version will be preserved in history.")) return; setPublishing(true); setError(""); try { await publishScorecardVersion(versionId, String(checklist?.independent_override_explanation ?? "")); setPublished(true); } catch (cause) { setError(friendlyPublisherError(cause)); } finally { setPublishing(false); } }
  if (loading) return <main className="publisher-shell"><div className="publisher-loading"><Loader2 className="publisher-spinner" /> Loading private preview…</div></main>;
  if (!version) return <main className="publisher-shell"><div className="publisher-form-error shell">{error || "Preview unavailable."}</div></main>;
  return <main className="publisher-shell"><header className="publisher-topbar"><Link href="/publisher" className="site-wordmark">DurablFi Publisher</Link><Link href={`/publisher/scorecards/${version.id}/edit`} className="text-link"><Pencil size={15} /> Edit draft</Link></header><section className="publisher-preview-bar"><span><Eye size={15} /> Authenticated preview · not indexed</span><span>Version {version.version_number} · {version.status}</span></section><article className="publisher-preview"><p className="eyebrow eyebrow-accent">Scorecard preview</p><h1>{version.protocol}</h1><p className="publisher-preview-dek">{version.product_pool} · {version.category} · {version.chain}</p><div className="publisher-preview-meta"><span><b>Yield</b>{version.current_yield}</span><span><b>Risk</b>{version.risk_rating ?? "Not rated"}</span><span><b>Observed</b>{version.yield_observed_at ? new Date(version.yield_observed_at).toLocaleString() : "Not set"}</span></div><section><p className="eyebrow">Overall risk rationale</p><p>{version.overall_risk_rationale}</p></section><section><p className="eyebrow">What could go wrong</p><p className="publisher-preview-long">{version.what_could_go_wrong}</p></section><section><p className="eyebrow">Final verdict</p><blockquote>{version.final_verdict}</blockquote></section><section><p className="eyebrow">Internal source record</p><p className="publisher-preview-muted">{sources.length} source(s) attached · {sources.filter((source) => source.source_type === "Primary").length} Primary · {sources.filter((source) => source.source_type === "Independent").length} Independent</p></section></article>{error && <div className="shell publisher-form-error" role="alert">{error}</div>}{published ? <div className="shell publisher-form-success" role="status"><CheckCircle2 size={16} /> Published successfully. <Link href="/publisher">Return to dashboard</Link></div> : <div className="publisher-preview-actions"><Link href={`/publisher/scorecards/${version.id}/edit`} className="button button-secondary"><ArrowLeft size={15} /> Back to editor</Link><button className="button button-primary" onClick={publish} disabled={publishing}>{publishing ? <><Loader2 className="publisher-spinner" size={15} /> Publishing…</> : <><Send size={15} /> Publish scorecard</>}</button></div>}</main>;
}
