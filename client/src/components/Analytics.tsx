import { useEffect, useState } from "react";
import { useLocation } from "wouter";

declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; } }
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

export default function Analytics() {
  const [location] = useLocation();
  const [consented, setConsented] = useState(() => localStorage.getItem("durablfi-cookie-consent") === "accepted");

  useEffect(() => { const onConsentChange = () => setConsented(localStorage.getItem("durablfi-cookie-consent") === "accepted"); window.addEventListener("durablfi-consent-change", onConsentChange); return () => window.removeEventListener("durablfi-consent-change", onConsentChange); }, []);
  useEffect(() => {
    if (!consented || !GA_ID) return;
    const scriptId = "durablfi-ga4-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script"); script.id = scriptId; script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`; document.head.appendChild(script);
      window.dataLayer = window.dataLayer || []; window.gtag = (...args: unknown[]) => window.dataLayer?.push(args); window.gtag("js", new Date()); window.gtag("config", GA_ID, { anonymize_ip: true });
    }
    window.gtag?.("event", "page_view", { page_path: location, page_location: window.location.href });
  }, [consented, location]);
  return null;
}
