import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";

export default function PublisherLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = requireSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/publisher");
    } catch {
      // Keep the response generic so the login page cannot enumerate accounts.
      setMessage("Sign-in failed. Check your credentials or contact the publisher account owner.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="publisher-auth-shell">
      <div className="publisher-auth-card">
        <Link href="/" className="text-link"><ArrowLeft size={15} /> Return to DurablFi</Link>
        <div className="publisher-auth-mark" aria-hidden="true"><LockKeyhole size={20} /></div>
        <p className="eyebrow eyebrow-accent">DurablFi Publisher</p>
        <h1>Sign in to publish.</h1>
        <p className="publisher-auth-copy">The Publisher is private. There is no public account creation.</p>
        <form onSubmit={handleSubmit} className="publisher-form">
          <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="publisher-auth-footnote">Email confirmation and Supabase Auth rate limits protect this entry point. Password recovery will use Supabase’s generic response.</p>
      </div>
    </main>
  );
}
