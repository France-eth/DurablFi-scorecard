import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Eye, FileText, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { requireSupabase } from "@/lib/supabase";
import { createArticleDraft, createArticleParent, friendlyPublisherError, getArticleSources, getArticleVersion, getArticleVersions, saveArticleSources, updateArticleDraft, type ArticleSource, type ArticleVersion, type ArticleVersionInput } from "@/lib/publisher";

type FormData = ArticleVersionInput;
const blank: FormData = { title: "", slug: "", excerpt: "", body: "", author_byline: "", featured_image_url: null };

function Field({ label, required = false, value, onChange, textarea = false, placeholder }: { label: string; required?: boolean; value: string; onChange: (value: string) => void; textarea?: boolean; placeholder?: string }) {
  const Tag = textarea ? "textarea" : "input";
  return <label className="publisher-field"><span>{label}{required && <b aria-hidden="true"> *</b>}</span><Tag value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} required={required} rows={textarea ? 10 : undefined} /></label>;
}

export default function PublisherArticleForm() {
  const [, params] = useRoute("/publisher/articles/:versionId/edit");
  const [, navigate] = useLocation();
  const versionId = params?.versionId;
  const [data, setData] = useState<FormData>(blank);
  const [version, setVersion] = useState<ArticleVersion | null>(null);
  const [sources, setSources] = useState<ArticleSource[]>([]);
  const [busy, setBusy] = useState<"loading" | "saving" | "">(versionId && versionId !== "new" ? "loading" : "");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { requireSupabase().auth.getSession().then(({ data: auth }) => setUserId(auth.session?.user.id ?? "")); }, []);
  useEffect(() => {
    if (!versionId || versionId === "new") return;
    let active = true;
    Promise.all([getArticleVersion(versionId), getArticleSources(versionId)]).then(([loaded, loadedSources]) => {
      if (!active) return;
      setVersion(loaded);
      setData({ title: loaded.title, slug: loaded.slug, excerpt: loaded.excerpt, body: loaded.body, author_byline: loaded.author_byline, featured_image_url: loaded.featured_image_url });
      setSources(loadedSources.map(({ title, url, verification_note }) => ({ title, url, verification_note })));
    }).catch((cause) => setError(friendlyPublisherError(cause))).finally(() => active && setBusy(""));
    return () => { active = false; };
  }, [versionId]);

  function setField(field: keyof FormData, value: string) { setData((current) => ({ ...current, [field]: value })); }
  function addSource() { setSources((current) => [...current, { title: "", url: "", verification_note: "" }]); }
  function updateSource(index: number, patch: Partial<ArticleSource>) { setSources((current) => current.map((source, itemIndex) => itemIndex === index ? { ...source, ...patch } : source)); }
  function removeSource(index: number) { setSources((current) => current.filter((_, itemIndex) => itemIndex !== index)); }

  async function saveDraft(event?: FormEvent) {
    event?.preventDefault(); setBusy("saving"); setError("");
    try {
      if (!userId) throw new Error("publisher_admin_required");
      let saved = version;
      if (!saved) {
        const parent = await createArticleParent({ title: data.title, slug: data.slug, created_by: userId });
        saved = await createArticleDraft({ ...data, article_id: parent.id, version_number: 1, created_by: userId });
      } else if (saved.status === "published") {
        const versions = await getArticleVersions(saved.article_id);
        saved = await createArticleDraft({ ...data, article_id: saved.article_id, version_number: Math.max(...versions.map((item) => item.version_number), 0) + 1, created_by: userId });
      } else {
        saved = await updateArticleDraft(saved.id, data);
      }
      await saveArticleSources(saved.id, sources);
      setVersion(saved);
      navigate(`/publisher/articles/${saved.id}/preview`);
    } catch (cause) { setError(friendlyPublisherError(cause)); } finally { setBusy(""); }
  }

  if (busy === "loading") return <main className="publisher-shell"><div className="publisher-loading"><Loader2 className="publisher-spinner" /> Loading article draft…</div></main>;
  return <main className="publisher-shell"><header className="publisher-topbar"><Link href="/publisher" className="site-wordmark">DurablFi Publisher</Link><Link href="/publisher" className="text-link"><ArrowLeft size={15} /> Dashboard</Link></header><section className="publisher-form-header"><p className="eyebrow eyebrow-accent">{version?.status === "published" ? "New article version" : "Article draft"}</p><h1>{version?.status === "published" ? `Update ${data.title}` : version ? "Edit article draft" : "New article"}</h1><p>Articles follow the same private Draft → Preview → Publish workflow, without scorecard methodology fields.</p></section><form className="publisher-editor" onSubmit={saveDraft}><section className="publisher-form-section"><div className="publisher-section-title"><FileText size={18} /><div><p className="eyebrow">Editorial record</p><h2>What is being published?</h2></div></div><div className="publisher-form-grid"><Field label="Title" required value={data.title} onChange={(value) => setField("title", value)} /><Field label="Slug" required value={data.slug} onChange={(value) => setField("slug", value)} placeholder="an-editorial-note" /><Field label="Author / byline" required value={data.author_byline} onChange={(value) => setField("author_byline", value)} /></div><div className="publisher-form-stack"><Field label="Excerpt" value={data.excerpt} onChange={(value) => setField("excerpt", value)} textarea placeholder="A short editorial summary." /><Field label="Body" required value={data.body} onChange={(value) => setField("body", value)} textarea placeholder="Write the article body here." /><Field label="Featured image URL" value={data.featured_image_url ?? ""} onChange={(value) => setField("featured_image_url", value)} placeholder="Optional" /></div></section><section className="publisher-form-section"><div className="publisher-section-title"><Plus size={18} /><div><p className="eyebrow">Internal sources</p><h2>What informed the article?</h2></div></div>{sources.map((source, index) => <div className="publisher-source-row" key={`${index}-${source.title}`}><Field label="Title" required value={source.title} onChange={(value) => updateSource(index, { title: value })} /><Field label="URL" required value={source.url} onChange={(value) => updateSource(index, { url: value })} /><Field label="Verification note" value={source.verification_note} onChange={(value) => updateSource(index, { verification_note: value })} /><button type="button" className="icon-button" aria-label="Remove source" onClick={() => removeSource(index)}><Trash2 size={16} /></button></div>)}<button type="button" className="button button-secondary" onClick={addSource}><Plus size={15} /> Add source</button></section>{error && <div className="publisher-form-error" role="alert">{error}</div>}<div className="publisher-form-actions"><Link href="/publisher" className="button button-secondary">Cancel</Link><button type="submit" className="button button-primary" disabled={busy === "saving"}>{busy === "saving" ? <><Loader2 className="publisher-spinner" size={15} /> Saving draft…</> : <><Save size={15} /> Save and preview</>}</button>{version && <Link href={`/publisher/articles/${version.id}/preview`} className="button button-secondary"><Eye size={15} /> Preview</Link>}</div></form></main>;
}
