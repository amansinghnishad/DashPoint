import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import ProtectedRoute from "./context/ProtectedRoute";
import PublicRoute from "./context/PublicRoute";
import { ToastProvider } from "./context/ToastContext";
import { Toaster } from "./components/Toaster";
import { PWAUpdatePrompt } from "./components/PWAStatus";
import { Login, Register } from "./pages/Auths";
import Dashboard from "./pages/dashboard/Dashboard";
import { LandingPage } from "./pages/landing";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardProvider>
                    <Dashboard />
                  </DashboardProvider>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster />
          <PWAUpdatePrompt />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
