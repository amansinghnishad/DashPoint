import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { useToast } from "../hooks/useToast";
import { authAPI } from "../services/modules/authApi";
import { setUnauthorizedHandler } from "../shared/api/httpClient";
import {
  clearAuthSession,
  clearFirstTimeUserFlag,
  clearNewlyRegisteredUser,
  getAuthToken,
  getFirstTimeUserFlag,
  getNewlyRegisteredUser,
  setAuthSession,
  setFirstTimeUserFlag,
  setNewlyRegisteredUser,
} from "../shared/auth/authSession";

const AuthContext = createContext();

const AuthActionType = Object.freeze({
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  CLEAR_ERROR: "CLEAR_ERROR",
  SESSION_WARNING: "SESSION_WARNING",
  SET_FIRST_TIME_USER: "SET_FIRST_TIME_USER",
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  sessionWarning: false,
  isFirstTimeUser: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case AuthActionType.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
        sessionWarning: false,
        isFirstTimeUser: action.isFirstTimeUser || false,
      };
    case AuthActionType.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        sessionWarning: false,
        isFirstTimeUser: false,
      };
    case AuthActionType.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        sessionWarning: false,
        isFirstTimeUser: false,
      };
    case AuthActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AuthActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AuthActionType.SESSION_WARNING:
      return {
        ...state,
        sessionWarning: action.payload,
      };
    case AuthActionType.SET_FIRST_TIME_USER:
      return {
        ...state,
        isFirstTimeUser: action.payload,
      };
    default:
      return state;
  }
}

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();

  const applyLogout = useCallback(
    (showToast = false) => {
      clearAuthSession();
      dispatch({ type: AuthActionType.LOGOUT });

      if (showToast) {
        toastInfo("Logged out.");
      }
    },
    [toastInfo]
  );

  const checkAuthStatus = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      dispatch({ type: AuthActionType.SET_LOADING, payload: false });
      return;
    }

    try {
      dispatch({ type: AuthActionType.SET_LOADING, payload: true });
      const response = await authAPI.verifyToken();

      if (!response?.success) {
        applyLogout();
        return;
      }

      dispatch({
        type: AuthActionType.LOGIN_SUCCESS,
        payload: response.data,
        isFirstTimeUser: getFirstTimeUserFlag(),
      });
    } catch (error) {
      if (error.response?.status === 401) {
        applyLogout();
        return;
      }

      dispatch({ type: AuthActionType.SET_LOADING, payload: false });
    }
  }, [applyLogout]);

  const loginUser = useCallback(
    async (credentials) => {
      dispatch({ type: AuthActionType.SET_LOADING, payload: true });

      try {
        const response = await authAPI.login(credentials);

        if (!response?.success) {
          const message = response?.message || "Login failed";
          dispatch({
            type: AuthActionType.LOGIN_FAILURE,
            payload: message,
          });
          toastError(message);
          return { success: false, error: message };
        }

        setAuthSession(response.data.token, response.data.user);

        const newlyRegisteredUser = getNewlyRegisteredUser();
        const isFirstTimeUser = newlyRegisteredUser === credentials.email;
        setFirstTimeUserFlag(isFirstTimeUser);
        if (isFirstTimeUser) {
          clearNewlyRegisteredUser();
        }

        dispatch({
          type: AuthActionType.LOGIN_SUCCESS,
          payload: response.data.user,
          isFirstTimeUser,
        });

        toastSuccess(
          `Welcome back${
            response.data.user?.firstName ? `, ${response.data.user.firstName}` : ""
          }.`
        );

        return { success: true, isFirstTimeUser };
      } catch (error) {
        const message = extractErrorMessage(error, "Login failed");
        dispatch({
          type: AuthActionType.LOGIN_FAILURE,
          payload: message,
        });
        toastError(message);
        return { success: false, error: message };
      }
    },
    [toastError, toastSuccess]
  );

  const registerUser = useCallback(
    async (userData) => {
      dispatch({ type: AuthActionType.SET_LOADING, payload: true });

      try {
        const response = await authAPI.register(userData);

        if (!response?.success) {
          const message = response?.message || "Registration failed";
          dispatch({
            type: AuthActionType.LOGIN_FAILURE,
            payload: message,
          });
          toastError(message);
          return { success: false, error: message };
        }

        setNewlyRegisteredUser(response.data?.user?.email);
        dispatch({ type: AuthActionType.SET_LOADING, payload: false });
        toastSuccess("Account created. Please sign in.");
        return { success: true };
      } catch (error) {
        const errorMessage = extractErrorMessage(error, "Registration failed");
        const errorDetails = error?.response?.data?.errors || null;

        dispatch({
          type: AuthActionType.LOGIN_FAILURE,
          payload: errorMessage,
        });
        toastError(errorMessage);

        return {
          success: false,
          error: errorDetails || errorMessage,
          details: errorDetails,
        };
      }
    },
    [toastError, toastSuccess]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      dispatch({ type: AuthActionType.SET_LOADING, payload: true });

      try {
        const response = await authAPI.googleAuth(credential);

        if (!response?.success) {
          const message = response?.message || "Google login failed";
          dispatch({
            type: AuthActionType.LOGIN_FAILURE,
            payload: message,
          });
          toastError(message);
          return { success: false, error: message };
        }

        const isFirstTimeUser = Boolean(response.data.isNewUser);
        setAuthSession(response.data.token, response.data.user);
        setFirstTimeUserFlag(isFirstTimeUser);

        dispatch({
          type: AuthActionType.LOGIN_SUCCESS,
          payload: response.data.user,
          isFirstTimeUser,
        });

        toastSuccess(
          `Welcome${
            response.data.user?.firstName ? `, ${response.data.user.firstName}` : ""
          }.`
        );

        return { success: true, isFirstTimeUser };
      } catch (error) {
        const message = extractErrorMessage(error, "Google login failed");
        dispatch({
          type: AuthActionType.LOGIN_FAILURE,
          payload: message,
        });
        toastError(message);
        return { success: false, error: message };
      }
    },
    [toastError, toastSuccess]
  );

  const logoutUser = useCallback(() => {
    applyLogout(true);
  }, [applyLogout]);

  const clearFirstTimeUser = useCallback(() => {
    clearFirstTimeUserFlag();
    dispatch({
      type: AuthActionType.SET_FIRST_TIME_USER,
      payload: false,
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AuthActionType.CLEAR_ERROR });
  }, []);

  const extendSession = useCallback(async () => {
    try {
      const response = await authAPI.verifyToken();
      if (!response?.success) {
        applyLogout();
        return false;
      }

      dispatch({ type: AuthActionType.SESSION_WARNING, payload: false });
      return true;
    } catch {
      applyLogout();
      return false;
    }
  }, [applyLogout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthSession();
      dispatch({ type: AuthActionType.LOGOUT });
    });

    return () => {
      setUnauthorizedHandler(undefined);
    };
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) return undefined;

    const tokenCheckInterval = setInterval(async () => {
      if (!getAuthToken()) return;

      try {
        await authAPI.verifyToken();
      } catch (error) {
        if (error.response?.status === 401) {
          applyLogout();
        }
      }
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [applyLogout, state.isAuthenticated]);

  const value = useMemo(
    () => ({
      ...state,
      loginUser,
      loginWithGoogle,
      registerUser,
      logoutUser,
      clearError,
      extendSession,
      clearFirstTimeUser,
    }),
    [
      clearError,
      clearFirstTimeUser,
      extendSession,
      loginUser,
      loginWithGoogle,
      logoutUser,
      registerUser,
      state,
    ]
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
