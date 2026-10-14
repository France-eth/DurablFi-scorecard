import { requireSupabase } from "./supabase";

export type ContentStatus = "draft" | "needs_review" | "published" | "unpublished";
export type RiskTier = "Low" | "Medium" | "High";

export type ScorecardVersionInput = {
  scorecard_id: string;
  version_number: number;
  status?: ContentStatus;
  protocol: string;
  product_pool: string;
  slug: string;
  category: string;
  chain: string;
  current_yield: string;
  yield_observed_at: string | null;
  yield_source: string;
  risk_rating: RiskTier | null;
  overall_risk_rationale: string;
  what_could_go_wrong: string;
  final_verdict: string;
  smart_contract_risk_notes: string;
  yield_sustainability_notes: string;
  liquidity_exit_risk_notes: string;
  dependency_risk_notes: string;
  key_dependencies: string;
  centralization_counterparty_risk_notes: string;
  governance_systemic_risk_notes: string;
  security_incident_history_notes: string;
  created_by?: string;
};

export type ScorecardVersion = ScorecardVersionInput & { id: string; created_at: string; updated_at: string; published_at: string | null };

export async function isPublisherAdmin(userId: string) {
  const { data, error } = await requireSupabase().from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getDashboardData() {
  const supabase = requireSupabase();
  const [scorecards, articles, activity] = await Promise.all([
    supabase.from("scorecards").select("id,slug,protocol,category,chain,status,publication_date,last_updated,published_version_id,legacy_imported").order("last_updated", { ascending: false }),
    supabase.from("articles").select("id,slug,title,status,publication_date,last_updated,published_version_id").order("last_updated", { ascending: false }),
    supabase.from("publisher_activity").select("*").order("created_at", { ascending: false }).limit(20),
  ]);
  if (scorecards.error) throw scorecards.error;
  if (articles.error) throw articles.error;
  if (activity.error) throw activity.error;
  return { scorecards: scorecards.data ?? [], articles: articles.data ?? [], activity: activity.data ?? [] };
}

export async function getAdminDashboardData() {
  const supabase = requireSupabase();
  const [admins, scorecards, articles, reviewFlags, activity] = await Promise.all([
    supabase.from("admin_users").select("user_id,created_at,disabled_at").order("created_at", { ascending: true }),
    supabase.from("scorecards").select("id,status"),
    supabase.from("articles").select("id,status"),
    supabase.from("scorecard_review_flags").select("id,status"),
    supabase.from("publisher_activity").select("id,actor_id,entity_type,action,created_at").order("created_at", { ascending: false }).limit(100),
  ]);
  for (const result of [admins, scorecards, articles, reviewFlags, activity]) if (result.error) throw result.error;
  return {
    admins: admins.data ?? [],
    scorecards: scorecards.data ?? [],
    articles: articles.data ?? [],
    reviewFlags: reviewFlags.data ?? [],
    activity: activity.data ?? [],
  };
}

export async function setPublisherAdminDisabled(userId: string, disabled: boolean) {
  const { data, error } = await requireSupabase().from("admin_users").update({ disabled_at: disabled ? new Date().toISOString() : null }).eq("user_id", userId).select("user_id,created_at,disabled_at").single();
  if (error) throw error;
  return data;
}

export async function createScorecardParent(input: { protocol: string; product_pool: string; slug: string; category: string; chain: string; created_by: string }) {
  const { data, error } = await requireSupabase().from("scorecards").insert({ ...input, status: "draft" }).select("id").single();
  if (error) throw error;
  return data;
}

export async function getScorecardVersions(scorecardId: string) {
  const { data, error } = await requireSupabase().from("scorecard_versions").select("*").eq("scorecard_id", scorecardId).order("version_number", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ScorecardVersion[];
}

export async function getScorecardVersion(versionId: string) {
  const { data, error } = await requireSupabase().from("scorecard_versions").select("*").eq("id", versionId).single();
  if (error) throw error;
  return data as ScorecardVersion;
}

export async function getScorecardSources(versionId: string) {
  const { data, error } = await requireSupabase().from("scorecard_sources").select("*").eq("version_id", versionId).order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function getPublishChecklist(versionId: string) {
  const { data, error } = await requireSupabase().from("scorecard_publish_checklists").select("*").eq("version_id", versionId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createScorecardDraft(input: ScorecardVersionInput) {
  const { data, error } = await requireSupabase().from("scorecard_versions").insert({ ...input, status: "draft" }).select().single();
  if (error) throw error;
  return data as ScorecardVersion;
}

export async function updateScorecardDraft(versionId: string, input: Partial<ScorecardVersionInput>) {
  const { data, error } = await requireSupabase().from("scorecard_versions").update({ ...input, status: "draft", updated_at: new Date().toISOString() }).eq("id", versionId).select().single();
  if (error) throw error;
  return data as ScorecardVersion;
}

export async function saveSources(versionId: string, sources: Array<{ title: string; url: string; source_type: "Primary" | "Independent"; verification_note: string }>) {
  const supabase = requireSupabase();
  const { error: removeError } = await supabase.from("scorecard_sources").delete().eq("version_id", versionId);
  if (removeError) throw removeError;
  if (!sources.length) return [];
  const { data, error } = await supabase.from("scorecard_sources").insert(sources.map((source) => ({ ...source, version_id: versionId }))).select();
  if (error) throw error;
  return data ?? [];
}

export async function savePublishChecklist(versionId: string, checklist: Record<string, boolean | string>) {
  const { data, error } = await requireSupabase().from("scorecard_publish_checklists").upsert({ version_id: versionId, ...checklist, updated_at: new Date().toISOString() }).select().single();
  if (error) throw error;
  return data;
}

export async function publishScorecardVersion(versionId: string, independentOverrideExplanation?: string) {
  const { data, error } = await requireSupabase().rpc("publish_scorecard_version", { p_version_id: versionId, p_independent_override_explanation: independentOverrideExplanation ?? null });
  if (error) throw error;
  return data;
}

export type ArticleVersion = {
  id: string;
  article_id: string;
  version_number: number;
  status: ContentStatus;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author_byline: string;
  featured_image_url: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleVersionInput = Omit<ArticleVersion, "id" | "created_at" | "updated_at" | "published_at" | "created_by" | "article_id" | "version_number" | "status">;
export type ArticleSource = { title: string; url: string; verification_note: string };

export async function getArticleVersion(versionId: string) {
  const { data, error } = await requireSupabase().from("article_versions").select("*").eq("id", versionId).single();
  if (error) throw error;
  return data as ArticleVersion;
}

export async function getArticleVersions(articleId: string) {
  const { data, error } = await requireSupabase().from("article_versions").select("*").eq("article_id", articleId).order("version_number", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ArticleVersion[];
}

export async function getArticleSources(versionId: string) {
  const { data, error } = await requireSupabase().from("article_sources").select("*").eq("version_id", versionId).order("created_at");
  if (error) throw error;
  return (data ?? []) as Array<ArticleSource & { id: string; version_id: string }>;
}

export async function createArticleParent(input: { title: string; slug: string; created_by: string }) {
  const { data, error } = await requireSupabase().from("articles").insert({ ...input, status: "draft" }).select("id").single();
  if (error) throw error;
  return data as { id: string };
}

export async function createArticleDraft(input: ArticleVersionInput & { article_id: string; version_number: number; created_by: string }) {
  const { data, error } = await requireSupabase().from("article_versions").insert({ ...input, status: "draft" }).select().single();
  if (error) throw error;
  return data as ArticleVersion;
}

export async function updateArticleDraft(versionId: string, input: Partial<ArticleVersionInput>) {
  const { data, error } = await requireSupabase().from("article_versions").update({ ...input, status: "draft", updated_at: new Date().toISOString() }).eq("id", versionId).select().single();
  if (error) throw error;
  return data as ArticleVersion;
}

export async function saveArticleSources(versionId: string, sources: ArticleSource[]) {
  const supabase = requireSupabase();
  const { error: removeError } = await supabase.from("article_sources").delete().eq("version_id", versionId);
  if (removeError) throw removeError;
  if (!sources.length) return [];
  const { data, error } = await supabase.from("article_sources").insert(sources.map((source) => ({ ...source, version_id: versionId }))).select();
  if (error) throw error;
  return data ?? [];
}

export async function publishArticleVersion(versionId: string) {
  const { data, error } = await requireSupabase().rpc("publish_article_version", { p_version_id: versionId });
  if (error) throw error;
  return data;
}

export function friendlyPublisherError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const known: Record<string, string> = {
    publisher_admin_required: "Your account is not authorized for Publisher access.",
    identity_fields_required: "Complete all identity fields before publishing.",
    yield_fields_required: "Complete the current yield, observation time, and yield source.",
    assessment_fields_required: "Complete the risk rating, rationale, failure paths, and final verdict.",
    research_sections_required: "Complete every structured research section.",
    primary_source_required: "Add at least one Primary source.",
    research_checklist_incomplete: "Complete every required research checklist item.",
    independent_source_override_required: "Add an Independent source or explain the override.",
    article_required_fields_missing: "Complete the title, slug, body, and byline before publishing.",
    schema_missing: "The Publisher database is not available yet. Apply the Supabase migration and retry.",
  };
  const matched = Object.entries(known).find(([key]) => message.includes(key));
  return matched?.[1] ?? (message.includes("relation") || message.includes("schema") ? known.schema_missing : "The request could not be completed. Check the fields and try again.");
}
