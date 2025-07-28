import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login/Login";
import { Register } from "./pages/register/Register";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { ToastContainer } from "./components/toast/index";
import { SessionWarning } from "./components/session-warning/index";
import { UpdateNotification } from "./components/update-notification";
import { OfflineIndicator } from "./components/offline-indicator";
import ConversationalInterface from "./components/conversational-interface";
import { useToast } from "./hooks/useToast";
import "./App.css";

// Clear localStorage data that should now be stored in database
const clearLegacyData = () => {
  const legacyKeys = [
    "stickyNotes",
    "todos",
    "extractedContents",
    "youtubeVideos",
  ];
  legacyKeys.forEach((key) => {
    if (localStorage.getItem(key)) {
      console.log(`Clearing legacy data: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// PublicRoute component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For login and register pages, redirect to dashboard if authenticated
  if (
    isAuthenticated &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/register" ||
      window.location.pathname === "/")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <div className="App">
        {" "}
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
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
                  <ConversationalInterface />
                </DashboardProvider>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />{" "}
        </Routes>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <SessionWarning />
        <UpdateNotification />
        <OfflineIndicator />
      </div>
    </Router>
  );
}

function App() {
  useEffect(() => {
    // Clear legacy localStorage data on app start
    clearLegacyData();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
