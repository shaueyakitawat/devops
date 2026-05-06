import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./lib/auth";
import "./styles/theme.css";
import "./styles/globals.css";
import "./i18n";

// Components
import TopBar from "./components/TopBar";
import Sidebar from "./components/SideBar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import OfficialResources from "./pages/OfficialResources";
import NewsInsights from "./pages/NewsInsights";
import AIAnalyzer from "./pages/AIAnalyzer";

function App() {
  const user = getCurrentUser();

  return (
    <BrowserRouter>
      {/* Top Horizontal Bar */}
      {user && <TopBar />}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Left Sidebar */}
        {user && <Sidebar />}

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <main style={{ flex: 1, padding: "20px" }}>
            <Routes>
              {/* Login Page */}
              <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Login />}
              />

              {/* Home */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              {/* Market */}
              <Route
                path="/market"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Market />
                  </ProtectedRoute>
                }
              />

              {/* Portfolio */}
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <Portfolio />
                  </ProtectedRoute>
                }
              />





              {/* Official Resources */}
              <Route
                path="/resources"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <OfficialResources />
                  </ProtectedRoute>
                }
              />

              {/* News Insights */}
              <Route
                path="/news-insights"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <NewsInsights />
                  </ProtectedRoute>
                }
              />

              {/* AI Analyzer */}
              <Route
                path="/ai-analyzer"
                element={
                  <ProtectedRoute requiredRole="learner">
                    <AIAnalyzer />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          {user && (
            <footer
              style={{
                background: "var(--neutralCard)",
                borderTop: "1px solid var(--border)",
                padding: "24px 0",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--textMuted)", fontSize: "14px" }}>
                <strong>
                  MoneyMitra provides educational content only. Not investment
                  advice.
                </strong>
              </p>
            </footer>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
