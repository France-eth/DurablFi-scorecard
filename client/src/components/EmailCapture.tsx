import { Check, Mail, Send } from "lucide-react";
import { FormEvent, useState } from "react";

export default function EmailCapture() {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) { event.currentTarget.reportValidity(); return; }
    setStatus("success");
  }

  return <section className="email-capture" aria-labelledby="email-capture-title"><div className="email-icon" aria-hidden="true"><Mail size={18} strokeWidth={1.7} /></div><div className="email-copy"><p className="eyebrow">Research notes</p><h2 id="email-capture-title">Stay close to the signal.</h2><p>Get a note when new DurablFi research is ready. No hype, no constant noise.</p></div><form className="email-form" onSubmit={handleSubmit} noValidate><label className="sr-only" htmlFor="subscriber-email">Email address</label><input id="subscriber-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" disabled={status === "success"} /><label className="honeypot" htmlFor="company">Leave this field empty</label><input className="honeypot" id="company" name="company" autoComplete="off" tabIndex={-1} /><button type="submit" className="button button-primary" disabled={status === "success"}>{status === "success" ? <>Received <Check size={15} strokeWidth={1.8} /></> : <>Notify me <Send size={15} strokeWidth={1.8} /></>}</button>{status === "success" ? <p className="form-status form-success" role="status"><Check size={13} /> Thanks — the form submission was received by this page. Delivery will activate when the newsletter endpoint is configured.</p> : <p className="form-note">Email destination pending configuration.</p>}</form></section>;
}
