import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import RouteLoader from "./RouteLoader";
import { DashboardProvider } from "../../context/DashboardContext";
import ErrorBoundary from "../../shared/ui/ErrorBoundary/ErrorBoundary";
import NotFoundPage from "../../shared/ui/ErrorState/NotFoundPage";
import PWAUpdatePrompt from "../../shared/ui/PWAStatus/PWAUpdatePrompt";
import Toaster from "../../shared/ui/Toaster/Toaster";
import { APP_ROUTES } from "../routes/paths";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";

const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../../features/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("../../features/dashboard/pages/DashboardPage"));
const LandingPage = lazy(() => import("../../features/landing/pages/LandingPage"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route
              path={APP_ROUTES.HOME}
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path={APP_ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path={APP_ROUTES.REGISTER}
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path={APP_ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardProvider>
                    <DashboardPage />
                  </DashboardProvider>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <Toaster />
      <PWAUpdatePrompt />
    </BrowserRouter>
  );
}
