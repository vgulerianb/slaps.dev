import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ReactExePage from "./pages/ReactExePage";
import SlapifyPage from "./pages/SlapifyPage";
import SiteLayout from "./components/SiteLayout";
import ScrollToTop from "./components/ScrollToTop";
import "./styles/site.css";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/react-exe" element={<ReactExePage />} />
          <Route path="/slapify" element={<SlapifyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}

export default App;
