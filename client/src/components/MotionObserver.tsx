import { useEffect } from "react";
import { useLocation } from "wouter";

const selector = "main section, main .scorecard-card, main .email-capture, main .article-end-cta";

export default function MotionObserver() {
  const [location] = useLocation();
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observed = new WeakSet<Element>();
    let observer: IntersectionObserver | null = null;
    const reveal = (element: HTMLElement, index: number) => {
      if (observed.has(element)) return;
      observed.add(element);
      element.classList.add("reveal-on-scroll");
      if (element.classList.contains("scorecard-card")) element.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 80}ms`);
      if (reducedMotion || !("IntersectionObserver" in window)) { element.classList.add("is-revealed"); return; }
      observer?.observe(element);
    };
    const scan = () => Array.from(document.querySelectorAll<HTMLElement>(selector)).forEach((element, index) => reveal(element, index));
    if (!reducedMotion && "IntersectionObserver" in window) observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer?.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    scan();
    const mutationObserver = new MutationObserver(scan);
    mutationObserver.observe(document.getElementById("main-content") ?? document.body, { childList: true, subtree: true });
    return () => { observer?.disconnect(); mutationObserver.disconnect(); };
  }, [location]);
  return null;
}
