import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import Analytics from "./components/Analytics";
import CookieConsent from "./components/CookieConsent";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteLayout from "./components/SiteLayout";

const Archive = lazy(() => import("./pages/Archive"));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Home = lazy(() => import("./pages/Home"));
const Methodology = lazy(() => import("./pages/Methodology"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Publisher = lazy(() => import("./pages/Publisher"));
const PublisherAdmin = lazy(() => import("./pages/PublisherAdmin"));
const PublisherArticleForm = lazy(() => import("./pages/PublisherArticleForm"));
const PublisherArticlePreview = lazy(() => import("./pages/PublisherArticlePreview"));
const PublisherLogin = lazy(() => import("./pages/PublisherLogin"));
const PublisherScorecardForm = lazy(() => import("./pages/PublisherScorecardForm"));
const PublisherScorecardPreview = lazy(() => import("./pages/PublisherScorecardPreview"));
const ScorecardDetail = lazy(() => import("./pages/ScorecardDetail"));
const Scorecards = lazy(() => import("./pages/Scorecards"));
function Router() { return <Suspense fallback={<div className="route-loading" aria-live="polite">Loading DurablFi…</div>}><Switch><Route path="/" component={Home} /><Route path="/scorecards" component={Scorecards} /><Route path="/scorecards/:slug" component={ScorecardDetail} /><Route path="/archive" component={Archive} /><Route path="/articles" component={Articles} /><Route path="/articles/:slug" component={ArticleDetail} /><Route path="/methodology" component={Methodology} /><Route path="/privacy" component={Privacy} /><Route path="/publisher/login" component={PublisherLogin} /><Route path="/publisher/scorecards/new/edit" component={PublisherScorecardForm} /><Route path="/publisher/scorecards/:versionId/edit" component={PublisherScorecardForm} /><Route path="/publisher/scorecards/:versionId/preview" component={PublisherScorecardPreview} /><Route path="/publisher/articles/new/edit" component={PublisherArticleForm} /><Route path="/publisher/articles/:versionId/edit" component={PublisherArticleForm} /><Route path="/publisher/articles/:versionId/preview" component={PublisherArticlePreview} /><Route path="/publisher/admin" component={PublisherAdmin} /><Route path="/publisher" component={Publisher} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>; }

export default function App() { return <ErrorBoundary><SiteLayout><Router /></SiteLayout><Analytics /><CookieConsent /></ErrorBoundary>; }
