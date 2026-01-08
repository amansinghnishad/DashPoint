import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../services/api";
import { useToast } from "../hooks/useToast";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
        sessionWarning: false,
        isFirstTimeUser: action.isFirstTimeUser || false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        sessionWarning: false,
        isFirstTimeUser: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        sessionWarning: false,
        isFirstTimeUser: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SESSION_WARNING":
      return {
        ...state,
        sessionWarning: action.payload,
      };
    case "SET_FIRST_TIME_USER":
      return {
        ...state,
        isFirstTimeUser: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  sessionWarning: false,
  isFirstTimeUser: false,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState); // checkAuthStatus function
  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await authAPI.verifyToken();
        if (response.success) {
          // Check if this is a first-time user
          const isFirstTimeUser =
            localStorage.getItem("isFirstTimeUser") === "true";
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: response.data,
            isFirstTimeUser: isFirstTimeUser,
          });
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("isFirstTimeUser");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        // Only clear token if it's actually an auth error
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("isFirstTimeUser");
        }
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [dispatch]);
  // loginUser function
  const loginUser = async (credentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authAPI.login(credentials);

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));

        // Check if this is a first-time user (just registered)
        const newlyRegisteredUser = localStorage.getItem("newlyRegisteredUser");
        const isFirstTimeUser = newlyRegisteredUser === credentials.email;

        if (isFirstTimeUser) {
          localStorage.setItem("isFirstTimeUser", "true");
          localStorage.removeItem("newlyRegisteredUser");
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: response.data.user,
        });

        toastSuccess(
          `Welcome back${
            response.data.user?.firstName
              ? `, ${response.data.user.firstName}`
              : ""
          }.`
        );

        return { success: true, isFirstTimeUser };
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: response.message || "Login failed",
        });
        toastError(response.message || "Login failed");
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      toastError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }; // registerUser function
  const registerUser = async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        // Store the registered user's email for first-time login detection
        localStorage.setItem("newlyRegisteredUser", response.data.user.email);

        // Don't automatically log in after registration
        dispatch({ type: "SET_LOADING", payload: false });
        toastSuccess("Account created. Please sign in.");
        return { success: true };
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: response.message || "Registration failed",
        });
        toastError(response.message || "Registration failed");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";
      let errorDetails = null;

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errorDetails = error.response.data.errors || null;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });

      toastError(errorMessage);

      return {
        success: false,
        error: errorDetails || errorMessage,
        details: errorDetails,
      };
    }
  };

  // loginWithGoogle function
  const loginWithGoogle = async (credential) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authAPI.googleAuth(credential);

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));

        if (response.data.isNewUser) {
          localStorage.setItem("isFirstTimeUser", "true");
        } else {
          localStorage.removeItem("isFirstTimeUser");
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: response.data.user,
          isFirstTimeUser: Boolean(response.data.isNewUser),
        });

        toastSuccess(
          `Welcome${
            response.data.user?.firstName
              ? `, ${response.data.user.firstName}`
              : ""
          }.`
        );

        return {
          success: true,
          isFirstTimeUser: Boolean(response.data.isNewUser),
        };
      }

      dispatch({
        type: "LOGIN_FAILURE",
        payload: response.message || "Google login failed",
      });
      toastError(response.message || "Google login failed");
      return { success: false, error: response.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Google login failed";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      toastError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  // logoutUser function
  const logoutUser = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("isFirstTimeUser");
    dispatch({ type: "LOGOUT" });

    toastInfo("Logged out.");
  }, [toastInfo, dispatch]);

  // clearFirstTimeUser function
  const clearFirstTimeUser = () => {
    localStorage.removeItem("isFirstTimeUser");
    dispatch({ type: "SET_FIRST_TIME_USER", payload: false });
  };
  // clearError function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // extendSession function
  const extendSession = async () => {
    try {
      const response = await authAPI.verifyToken();
      if (response.success) {
        dispatch({ type: "SESSION_WARNING", payload: false });
        return true;
      }
    } catch {
      logoutUser();
      return false;
    }
  };

  // Check token once when the provider mounts.
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Set up periodic token verification (every 10 minutes) only while authenticated.
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const tokenCheckInterval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await authAPI.verifyToken();
      } catch (error) {
        // Only logout if it's actually an auth error, not a network error
        if (error.response?.status === 401) {
          logoutUser();
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [logoutUser, state.isAuthenticated]);
  const value = {
    ...state,
    loginUser,
    loginWithGoogle,
    registerUser,
    logoutUser,
    clearError,
    extendSession,
    clearFirstTimeUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
