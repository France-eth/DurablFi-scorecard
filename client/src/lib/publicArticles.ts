import { requireSupabase } from "./supabase";

export type PublishedArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author_byline: string;
  featured_image_url: string | null;
  publication_date: string | null;
  last_updated: string | null;
};

export async function getPublishedArticles() {
  const { data, error } = await requireSupabase()
    .from("published_articles_public")
    .select("id,slug,title,excerpt,body,author_byline,featured_image_url,publication_date,last_updated")
    .order("publication_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PublishedArticle[];
}

export async function getPublishedArticle(slug: string) {
  const { data, error } = await requireSupabase()
    .from("published_articles_public")
    .select("id,slug,title,excerpt,body,author_byline,featured_image_url,publication_date,last_updated")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as PublishedArticle | null;
}
