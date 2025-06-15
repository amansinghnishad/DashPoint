import { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

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
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        sessionWarning: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        sessionWarning: false,
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
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState); // checkAuthStatus function
  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await authAPI.verifyToken();
        if (response.success) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: response.data,
          });
        } else {
          console.log("Token verification failed, clearing local storage");
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.log("Auth check error:", error.message);
        // Only clear token if it's actually an auth error
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
        }
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // loginUser function
  const loginUser = async (credentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authAPI.login(credentials);

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: response.data.user,
        });

        return { success: true };
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: response.message || "Login failed",
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // registerUser function
  const registerUser = async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: response.data.user,
        });

        return { success: true };
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: response.message || "Registration failed",
        });
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

      return {
        success: false,
        error: errorDetails || errorMessage,
        details: errorDetails,
      };
    }
  };

  // logoutUser function
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    dispatch({ type: "LOGOUT" });
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
    } catch (error) {
      logoutUser();
      return false;
    }
  };
  useEffect(() => {
    checkAuthStatus();

    // Set up periodic token verification (every 10 minutes)
    const tokenCheckInterval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (token && state.isAuthenticated) {
        try {
          await authAPI.verifyToken();
          console.log("Token verification successful");
        } catch (error) {
          console.log("Token verification failed:", error.message);
          // Only logout if it's actually an auth error, not a network error
          if (error.response?.status === 401) {
            console.log("Authentication failed, logging out");
            logoutUser();
          }
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [state.isAuthenticated]);
  const value = {
    ...state,
    loginUser,
    registerUser,
    logoutUser,
    clearError,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
