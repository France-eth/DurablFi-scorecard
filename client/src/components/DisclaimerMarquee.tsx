const disclaimer = "Scorecards are editorial research, not investment advice. DeFi involves material risk, including loss of capital.";

export default function DisclaimerMarquee() { return <aside className="disclaimer-marquee" aria-label="Research disclaimer"><div className="disclaimer-marquee-viewport"><div className="disclaimer-marquee-track"><span>{disclaimer}</span><b aria-hidden="true">·</b><span>{disclaimer}</span><b aria-hidden="true">·</b><span>{disclaimer}</span><b aria-hidden="true">·</b></div></div></aside>; }
