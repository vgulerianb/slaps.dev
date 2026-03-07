import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ReactExePage from "./pages/ReactExePage";
import SlapifyPage from "./pages/SlapifyPage";
import SiteLayout from "./components/SiteLayout";
import ScrollToTop from "./components/ScrollToTop";
import "./styles/site.css";

const DocsPage = lazy(() => import("./pages/DocsPage"));

function DocsFallback() {
  return (
    <div className="docs-page" style={{ padding: "2rem 2.5rem" }}>
      <p className="docs-sidebar__tagline">Loading documentation…</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/react-exe" element={<ReactExePage />} />
          <Route path="/slapify" element={<SlapifyPage />} />
          <Route
            path="/:product/docs"
            element={
              <Suspense fallback={<DocsFallback />}>
                <DocsPage />
              </Suspense>
            }
          />
          <Route
            path="/:product/docs/:slug"
            element={
              <Suspense fallback={<DocsFallback />}>
                <DocsPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}

export default App;
