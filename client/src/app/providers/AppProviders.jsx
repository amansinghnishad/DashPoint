import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider } from "../../context/AuthContext";
import { ToastProvider } from "../../context/ToastContext";
import { GOOGLE_CLIENT_ID } from "../../shared/config/appConfig";

export default function AppProviders({ children }) {
  const appTree = GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    children
  );

  return (
    <ToastProvider>
      <AuthProvider>{appTree}</AuthProvider>
    </ToastProvider>
  );
}
