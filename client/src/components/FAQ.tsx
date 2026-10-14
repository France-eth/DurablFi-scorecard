import { ChevronDown } from "lucide-react";

const questions = [
  { question: "Is this financial advice?", answer: "No. DurablFi publishes educational research, not personalized financial advice, investment recommendations, or guarantees. DeFi involves material risk, including loss of capital." },
  { question: "How often are scorecards updated?", answer: "Scorecards are reviewed manually when the underlying risk picture or yield context changes. Each record shows its original publication date and latest update date when an update is made." },
  { question: "Why isn't this automated?", answer: "Automation can surface signals, but it cannot replace judgment about dependencies, governance, liquidity, and failure paths. DurablFi keeps the editorial decision and explanation human-led." },
  { question: "Who writes these?", answer: "The scorecards are written and reviewed by the DurablFi editorial research process. Each record is intended to make the reasoning and caveats readable rather than hide them behind a score." },
  { question: "Is it really free?", answer: "Yes. The Scorecard Library is publicly accessible and currently has no paywall, login, payment system, or locked content." },
];

export default function FAQ() { return <section className="section faq-section" aria-labelledby="faq-title"><div className="shell faq-grid"><p className="section-index">FAQ</p><div><h2 id="faq-title">The short answers.</h2><div className="faq-list">{questions.map((item) => <details className="faq-item" key={item.question}><summary>{item.question}<ChevronDown size={17} strokeWidth={1.5} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div></div></div></section>; }
