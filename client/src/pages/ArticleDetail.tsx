import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, FileText, Linkedin, Send, Share2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { getPublishedArticle, type PublishedArticle } from "@/lib/publicArticles";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Not set";
}

function shareTarget(baseUrl: string, source: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "article_share");
  return encodeURIComponent(url.toString());
}

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const [article, setArticle] = useState<PublishedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const slug = params?.slug;

  useEffect(() => {
    if (!slug) return;
    let active = true;
    getPublishedArticle(slug).then((loaded) => { if (active) setArticle(loaded); }).catch(() => { if (active) setError("This article could not be loaded right now."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return <main className="page-shell"><section className="page-hero"><div className="shell"><p className="eyebrow eyebrow-accent">Articles</p><h1>Loading the published note…</h1></div></section></main>;
  if (error || !article) return <main className="page-shell"><section className="page-hero"><div className="shell"><p className="eyebrow">Not found</p><h1>{error || "That article is not published."}</h1><Link href="/articles" className="button button-primary"><ArrowLeft size={16} /> Back to articles</Link></div></section></main>;

  const pageUrl = typeof window === "undefined" ? `https://durablfi.com/articles/${article.slug}` : window.location.href;
  const encodedUrl = shareTarget(pageUrl, "x");
  const encodedLinkedInUrl = shareTarget(pageUrl, "linkedin");
  const encodedTelegramUrl = shareTarget(pageUrl, "telegram");
  const encodedTitle = encodeURIComponent(article.title);
  return <main className="page-shell detail-page"><div className="shell detail-back-row"><Link href="/articles" className="back-link"><ArrowLeft size={15} /> Back to articles</Link><span className="detail-record">Independent editorial note</span></div><article className="shell scorecard-article public-article"><header className="article-header"><div className="article-kicker"><span className="article-status"><span className="status-dot" aria-hidden="true" /> Published article</span><span>Published {formatDate(article.publication_date)}{article.last_updated ? ` · Updated ${formatDate(article.last_updated)}` : ""}</span></div><h1>{article.title}</h1><p className="article-dek">By {article.author_byline}</p>{article.excerpt && <p className="public-article-excerpt">{article.excerpt}</p>}{article.featured_image_url && <img className="public-article-image" src={article.featured_image_url} alt="" />}<div className="article-share" aria-label="Share this article"><span className="article-share-label"><Share2 size={15} /> Share this note</span><div className="article-share-links"><a className="article-share-link" href={`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share this article on X"><span className="article-share-letter" aria-hidden="true">X</span><span>X</span></a><a className="article-share-link" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedLinkedInUrl}`} target="_blank" rel="noreferrer" aria-label="Share this article on LinkedIn"><Linkedin size={15} aria-hidden="true" /><span>LinkedIn</span></a><a className="article-share-link" href={`https://t.me/share/url?url=${encodedTelegramUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" aria-label="Share this article on Telegram"><Send size={15} aria-hidden="true" /><span>Telegram</span></a></div></div></header><div className="article-layout"><aside className="article-aside"><div className="aside-sticky"><p className="eyebrow">At a glance</p><a href="#article-body">Read the note <ArrowUpRight size={13} /></a><div className="aside-rule" /><p className="aside-note"><FileText size={15} /> Manually researched and written</p></div></aside><div className="article-body" id="article-body"><section className="article-section public-article-body">{article.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section><section className="article-section verdict-section"><div className="verdict-box"><BookOpen size={18} strokeWidth={1.5} /><p>DurablFi articles are independent editorial research, not financial advice.</p></div></section></div></div></article><div className="shell article-end-cta"><p>Read the rest of the publication.</p><Link href="/articles" className="text-link">Browse all articles <span aria-hidden="true">↗</span></Link></div></main>;
}
