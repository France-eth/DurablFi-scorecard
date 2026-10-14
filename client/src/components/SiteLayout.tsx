import { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import MotionObserver from "./MotionObserver";
import ProtocolTicker from "./ProtocolTicker";
import ScrollProgress from "./ScrollProgress";
import Seo from "./Seo";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function SiteLayout({ children }: { children: ReactNode }) { return <div className="site-shell"><Seo /><MotionObserver /><ScrollProgress /><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><Breadcrumbs /><main id="main-content">{children}</main><ProtocolTicker /><SiteFooter /></div>; }
