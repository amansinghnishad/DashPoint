import { createContext, useContext, useMemo } from "react";

import { useToast } from "../hooks/useToast";
import useAuthController from "./auth/useAuthController";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const { state, actions } = useAuthController({
    toastSuccess,
    toastError,
    toastInfo,
  });

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [actions, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
