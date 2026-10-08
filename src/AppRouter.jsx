import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getSession } from "./auth/authStorage";
import CreateAccountPage from "./components/portal/CreateAccountPage";
import DashboardPage from "./components/portal/DashboardPage";
import LoginPage from "./components/portal/LoginPage";
import "./components/portal/portal.css";

const PhysicsLab = lazy(() => import("./App.jsx"));

function RequireAccount({ children }) {
  const session = getSession();
  if (!session || session.guest) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LabFallback() {
  return <div className="tpl-lab-fallback">Loading Touchless Physics Lab…</div>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateAccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAccount>
              <DashboardPage />
            </RequireAccount>
          }
        />
        <Route
          path="/lab"
          element={
            <Suspense fallback={<LabFallback />}>
              <PhysicsLab />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
