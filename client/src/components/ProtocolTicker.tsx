import { scorecards } from "@/data/scorecards";

const tickerItems = Array.from(new Map(scorecards.flatMap((scorecard) => [[scorecard.protocolName, scorecard.protocolName], [scorecard.category, scorecard.category]])).values());

export default function ProtocolTicker() { return <aside className="protocol-ticker" aria-label="Published protocol and category index"><div className="protocol-ticker-viewport"><div className="protocol-ticker-track">{[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => <span key={`${item}-${index}`}><b aria-hidden="true">•</b>{item}</span>)}</div></div></aside>; }
