import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, BookOpen, Home, LayoutDashboard, LogOut, RefreshCw, Settings, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Session } from "@supabase/supabase-js";
import { getAdminDashboardData, friendlyPublisherError, isPublisherAdmin, setPublisherAdminDisabled } from "@/lib/publisher";

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function initials(userId: string) {
  return userId.slice(0, 2).toUpperCase();
}

export default function PublisherAdmin() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const { requireSupabase } = await import("@/lib/supabase");
      const supabase = requireSupabase();
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) { navigate("/publisher/login"); return; }
      if (!(await isPublisherAdmin(auth.session.user.id))) { setError("This account is not authorized for Publisher administration."); return; }
      setSession(auth.session);
      setData(await getAdminDashboardData());
    } catch (cause) { setError(friendlyPublisherError(cause)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [navigate]);

  async function signOut() {
    const { requireSupabase } = await import("@/lib/supabase");
    await requireSupabase().auth.signOut();
    navigate("/publisher/login");
  }

  async function toggleAdmin(userId: string, disabled: boolean) {
    if (disabled && !window.confirm("Block this Publisher account? This changes access to private research records.")) return;
    setNotice(""); setError("");
    try { await setPublisherAdminDisabled(userId, disabled); setNotice(disabled ? "Publisher access blocked." : "Publisher access restored."); await load(); }
    catch (cause) { setError(friendlyPublisherError(cause)); }
  }

  const publishedCount = useMemo(() => data ? data.scorecards.filter((item) => item.status === "published").length + data.articles.filter((item) => item.status === "published").length : 0, [data]);
  const draftCount = useMemo(() => data ? data.scorecards.filter((item) => item.status === "draft").length + data.articles.filter((item) => item.status === "draft").length : 0, [data]);
  const openFlags = data?.reviewFlags.filter((item) => item.status === "open").length ?? 0;
  const activityByDay = useMemo(() => {
    const days = new Map<string, number>();
    for (const item of data?.activity ?? []) { const day = new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }); days.set(day, (days.get(day) ?? 0) + 1); }
    return Array.from(days.entries()).slice(0, 7).reverse();
  }, [data]);
  const maxActivity = Math.max(1, ...activityByDay.map(([, count]) => count));

  if (loading) return <main className="publisher-shell"><div className="publisher-loading"><RefreshCw className="publisher-spinner" /> Checking admin access…</div></main>;
  return <main className="publisher-shell admin-shell"><aside className="admin-sidebar"><Link href="/publisher" className="admin-brand"><span className="wordmark-mark" aria-hidden="true">D</span><span>DurablFi Publisher</span></Link><nav className="admin-nav" aria-label="Admin navigation"><a href="#overview"><LayoutDashboard size={16} /> Overview</a><a href="#users"><Users size={16} /> Users</a><a href="#analytics"><BarChart3 size={16} /> Analytics</a><a href="#settings"><Settings size={16} /> Settings</a></nav><div className="admin-sidebar-bottom"><Link href="/"><Home size={16} /> Public site</Link><button onClick={signOut}><LogOut size={16} /> Log out</button></div></aside><section className="admin-main"><header className="admin-header"><div><p className="eyebrow eyebrow-accent">Founder access</p><h1>Admin overview</h1><p>Manage Publisher access and inspect real editorial activity. Auth-wide analytics are not enabled in this environment.</p></div><div className="admin-header-actions"><span className="admin-session-badge"><ShieldCheck size={15} /> Admin verified</span><button className="text-link" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button></div></header>{error && <div className="publisher-inline-error" role="alert">{error}<button className="text-link" onClick={() => void load()}>Retry</button></div>}{notice && <div className="admin-notice" role="status">{notice}</div>}<section id="overview" className="admin-section"><div className="admin-section-heading"><div><p className="eyebrow">System overview</p><h2>Telemetry status</h2></div><span className="admin-data-note">No fabricated metrics</span></div><div className="admin-metrics-grid"><div className="admin-metric"><span>Total Auth users</span><strong>—</strong><small>Supabase Auth user management is not exposed through the browser.</small></div><div className="admin-metric"><span>Active sessions</span><strong>—</strong><small>Session telemetry is not collected by DurablFi.</small></div><div className="admin-metric"><span>Growth rate</span><strong>—</strong><small>Analytics integration is not configured.</small></div><div className="admin-metric"><span>System load</span><strong>—</strong><small>Infrastructure metrics are outside the Publisher database.</small></div></div><div className="admin-metrics-grid admin-real-metrics"><div className="admin-metric"><span>Published records</span><strong>{publishedCount}</strong><small>Published scorecards and articles.</small></div><div className="admin-metric"><span>Draft records</span><strong>{draftCount}</strong><small>Private records awaiting review.</small></div><div className="admin-metric"><span>Open review flags</span><strong>{openFlags}</strong><small>Internal flags requiring a decision.</small></div><div className="admin-metric"><span>Allowlisted accounts</span><strong>{data?.admins.length ?? 0}</strong><small>Publisher access records.</small></div></div></section><section id="users" className="admin-section"><div className="admin-section-heading"><div><p className="eyebrow">Access control</p><h2>Publisher users</h2></div><span className="admin-data-note">RLS protected</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Added</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{(data?.admins ?? []).map((admin) => { const isCurrent = admin.user_id === session?.user.id; const blocked = Boolean(admin.disabled_at); return <tr key={admin.user_id}><td><div className="admin-user-cell"><span className="admin-avatar">{initials(admin.user_id)}</span><div><strong>{isCurrent ? session?.user.email ?? "Current founder" : "Publisher account"}</strong><small>{admin.user_id}</small></div></div></td><td><span className="admin-role">{isCurrent ? "Founder admin" : "Publisher admin"}</span></td><td><span className={`admin-status ${blocked ? "blocked" : "active"}`}><i aria-hidden="true" />{blocked ? "Blocked" : "Active"}</span></td><td>{dateLabel(admin.created_at)}</td><td>{isCurrent ? <span className="admin-current-label">Current account</span> : <button className="admin-action" onClick={() => void toggleAdmin(admin.user_id, !blocked)}>{blocked ? "Restore" : "Block"}</button>}</td></tr>; })}</tbody></table></div></section><section id="analytics" className="admin-section"><div className="admin-section-heading"><div><p className="eyebrow">Editorial activity</p><h2>Publishing activity</h2></div><Activity size={17} /></div><div className="admin-analytics-card"><div className="admin-chart-label"><span>Activity events by day</span><small>{data?.activity.length ?? 0} recent events</small></div>{activityByDay.length ? <div className="admin-chart" aria-label="Editorial activity bar chart">{activityByDay.map(([day, count]) => <div className="admin-chart-column" key={day}><span className="admin-chart-value">{count}</span><div className="admin-chart-bar" style={{ height: `${Math.max(8, count / maxActivity * 100)}%` }} /><small>{day}</small></div>)}</div> : <p className="publisher-empty">No publishing activity has been recorded yet.</p>}</div><div className="admin-analytics-grid"><div className="admin-analytics-card"><BookOpen size={17} /><h3>Traffic sources</h3><p>Not collected. Google Analytics remains consent-gated and is not mirrored into Publisher metrics.</p></div><div className="admin-analytics-card"><Activity size={17} /><h3>Performance</h3><p>Not collected. Use your hosting provider for infrastructure and response-time telemetry.</p></div></div></section><section id="settings" className="admin-section admin-settings"><div className="admin-section-heading"><div><p className="eyebrow">Settings</p><h2>Security posture</h2></div><Settings size={17} /></div><p>Supabase Auth controls identity and sessions. The Founder account is authorized through the database-enforced <code>admin_users</code> allowlist; the browser never receives a service-role key.</p><Link href="/publisher" className="text-link">Return to Publisher workspace <span aria-hidden="true">↗</span></Link></section></section></main>;
}
