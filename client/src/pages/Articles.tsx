import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { getPublishedArticles, type PublishedArticle } from "@/lib/publicArticles";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Not set";
}

export default function Articles() {
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; getPublishedArticles().then((loaded) => { if (active) setArticles(loaded); }).catch(() => { if (active) setError("Published articles could not be loaded right now."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  return <main className="page-shell"><section className="page-hero"><div className="shell"><p className="eyebrow eyebrow-accent">Articles</p><h1>Independent editorial notes.</h1><p className="page-hero-lede">Articles are a separate publishing stream from the scorecard library.</p></div></section><section className="section"><div className="shell">{loading ? <div className="empty-editorial-state"><BookOpen size={24} strokeWidth={1.4} /><h2>Loading published notes…</h2></div> : error ? <div className="empty-editorial-state"><BookOpen size={24} strokeWidth={1.4} /><h2>{error}</h2><Link href="/articles" className="text-link">Try again <ArrowRight size={15} /></Link></div> : articles.length ? <div className="editorial-list">{articles.map((article) => <article className="editorial-list-item" key={article.id}><div><p className="eyebrow">{formatDate(article.publication_date)}{article.last_updated ? ` · Updated ${formatDate(article.last_updated)}` : ""}</p><h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt || article.body.slice(0, 180)}</p><span className="article-byline">By {article.author_byline}</span></div><Link href={`/articles/${article.slug}`} className="text-link" aria-label={`Read ${article.title}`}>Read note <ArrowRight size={15} /></Link></article>)}</div> : <div className="empty-editorial-state"><BookOpen size={24} strokeWidth={1.4} /><h2>The first note is still being written.</h2><p>Published articles will appear here once they have completed the private Draft → Preview → Publish workflow used by the Publisher.</p><Link href="/scorecards" className="text-link">Read the free scorecard library <ArrowRight size={15} /></Link></div>}</div></section></main>;
}
