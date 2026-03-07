import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ReactExePage from "./pages/ReactExePage";
import SlapifyPage from "./pages/SlapifyPage";
import SiteLayout from "./components/SiteLayout";
import ScrollToTop from "./components/ScrollToTop";
import "./styles/site.css";

const RunmixPage = lazy(() => import("./pages/RunmixPage"));
const GhostEnvPage = lazy(() => import("./pages/GhostEnvPage"));
const DocsIndexPage = lazy(() => import("./pages/DocsIndexPage"));
const DocsPage = lazy(() => import("./pages/DocsPage"));

function PageFallback() {
  return <div style={{ padding: "4rem 2.5rem", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>Loading…</div>;
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
            path="/runmix"
            element={
              <Suspense fallback={<PageFallback />}>
                <RunmixPage />
              </Suspense>
            }
          />
          <Route
            path="/ghost-env"
            element={
              <Suspense fallback={<PageFallback />}>
                <GhostEnvPage />
              </Suspense>
            }
          />
          <Route
            path="/docs"
            element={
              <Suspense fallback={<PageFallback />}>
                <DocsIndexPage />
              </Suspense>
            }
          />
          <Route
            path="/docs/:product"
            element={
              <Suspense fallback={<PageFallback />}>
                <DocsPage />
              </Suspense>
            }
          />
          <Route
            path="/docs/:product/:slug"
            element={
              <Suspense fallback={<PageFallback />}>
                <DocsPage />
              </Suspense>
            }
          />
          {/* Legacy redirects for old doc URLs */}
          <Route path="/:product/docs" element={<Navigate to="/docs" replace />} />
          <Route path="/:product/docs/:slug" element={<Navigate to="/docs" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}

export default App;
