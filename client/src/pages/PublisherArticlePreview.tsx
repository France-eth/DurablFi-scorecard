import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, Loader2, Pencil, Send } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { friendlyPublisherError, getArticleSources, getArticleVersion, publishArticleVersion, type ArticleSource, type ArticleVersion } from "@/lib/publisher";

export default function PublisherArticlePreview() {
  const [, params] = useRoute("/publisher/articles/:versionId/preview");
  const [, navigate] = useLocation();
  const versionId = params?.versionId;
  const [version, setVersion] = useState<ArticleVersion | null>(null);
  const [sources, setSources] = useState<ArticleSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!versionId) return;
    let active = true;
    Promise.all([getArticleVersion(versionId), getArticleSources(versionId)]).then(([loaded, loadedSources]) => { if (active) { setVersion(loaded); setSources(loadedSources); } }).catch((cause) => setError(friendlyPublisherError(cause))).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [versionId]);

  async function publish() {
    if (!versionId || !window.confirm("Publish this article version? The previous published version will be preserved in history.")) return;
    setPublishing(true); setError("");
    try { await publishArticleVersion(versionId); setPublished(true); } catch (cause) { setError(friendlyPublisherError(cause)); } finally { setPublishing(false); }
  }

  if (loading) return <main className="publisher-shell"><div className="publisher-loading"><Loader2 className="publisher-spinner" /> Loading private preview…</div></main>;
  if (!version) return <main className="publisher-shell"><div className="publisher-form-error shell">{error || "Preview unavailable."}</div></main>;
  return <main className="publisher-shell"><header className="publisher-topbar"><Link href="/publisher" className="site-wordmark">DurablFi Publisher</Link><Link href={`/publisher/articles/${version.id}/edit`} className="text-link"><Pencil size={15} /> Edit draft</Link></header><section className="publisher-preview-bar"><span><Eye size={15} /> Authenticated preview · not indexed</span><span>Version {version.version_number} · {version.status}</span></section><article className="publisher-preview publisher-article-preview"><p className="eyebrow eyebrow-accent">Article preview</p><h1>{version.title}</h1><p className="publisher-preview-dek">{version.author_byline}</p>{version.excerpt && <p className="publisher-article-excerpt">{version.excerpt}</p>}<div className="publisher-preview-long publisher-article-body">{version.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{version.featured_image_url && <p className="publisher-preview-muted">Featured image: {version.featured_image_url}</p>}<section><p className="eyebrow">Internal source record</p><p className="publisher-preview-muted">{sources.length} source(s) attached.</p></section></article>{error && <div className="shell publisher-form-error" role="alert">{error}</div>}{published ? <div className="shell publisher-form-success" role="status"><CheckCircle2 size={16} /> Published successfully. <Link href="/publisher">Return to dashboard</Link></div> : <div className="publisher-preview-actions"><Link href={`/publisher/articles/${version.id}/edit`} className="button button-secondary"><ArrowLeft size={15} /> Back to editor</Link><button className="button button-primary" onClick={publish} disabled={publishing}>{publishing ? <><Loader2 className="publisher-spinner" size={15} /> Publishing…</> : <><Send size={15} /> Publish article</>}</button></div>}</main>;
}
