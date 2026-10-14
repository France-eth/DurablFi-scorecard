import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem("durablfi-cookie-consent"));
  }, []);

  function choose(value: "accepted" | "declined") {
    localStorage.setItem("durablfi-cookie-consent", value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("durablfi-consent-change"));
  }

  if (!visible) return null;
  return <aside className="cookie-banner" aria-label="Cookie preferences"><div><strong>Privacy choices</strong><p>DurablFi uses optional Google Analytics to understand aggregate site usage. No analytics cookies load unless you accept.</p></div><div className="cookie-actions"><button type="button" className="button button-secondary" onClick={() => choose("declined")}>Decline</button><button type="button" className="button button-primary" onClick={() => choose("accepted")}>Accept analytics</button><Link href="/privacy" className="cookie-policy" onClick={() => setVisible(false)}>Privacy Policy</Link></div></aside>;
}
