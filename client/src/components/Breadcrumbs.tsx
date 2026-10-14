import { Link, useLocation } from "wouter";
import { getScorecard } from "@/data/scorecards";

export default function Breadcrumbs() {
  const [location] = useLocation();
  if (location === "/" || location === "/404") return null;

  const scorecard = location.startsWith("/scorecards/") ? getScorecard(location.split("/").pop()) : undefined;
  const items = location.startsWith("/scorecards/") && scorecard
    ? [{ label: "Scorecards", href: "/scorecards" }, { label: scorecard.protocolName }]
    : location === "/scorecards"
      ? [{ label: "Scorecards" }]
      : location === "/archive"
        ? [{ label: "Scorecard Library" }]
        : location === "/privacy"
          ? [{ label: "Privacy Policy" }]
        : [{ label: "Page" }];

  return <nav className="breadcrumbs shell" aria-label="Breadcrumb"><ol><li><Link href="/">Home</Link><span aria-hidden="true">/</span></li>{items.map((item) => <li key={item.label}>{item.href ? <><Link href={item.href}>{item.label}</Link><span aria-hidden="true">/</span></> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
