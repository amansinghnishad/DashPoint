import { createContext, useContext, useReducer, useEffect, useCallback } from "react";

import { useActivity } from "../hooks/useActivity";
import { collectionsAPI } from "../services/modules/collectionsApi";
import { youtubeAPI } from "../services/modules/youtubeApi";

const DashboardContext = createContext();

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState = {
  stats: {
    collections: 0,
    videos: 0,
  },
  loading: {
    stats: false,
  },
  error: null,
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { addActivity, getRecentActivities } = useActivity();

  const loadStats = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "stats", value: true } });

    try {
      const [collectionsRes, videosRes] = await Promise.all([
        collectionsAPI.getCollections(1, 1),
        youtubeAPI.getAll(1, 1),
      ]);

      dispatch({
        type: "SET_STATS",
        payload: {
          collections: collectionsRes.success ? collectionsRes.data?.pagination?.total || 0 : 0,
          videos: videosRes.success ? videosRes.pagination?.total || 0 : 0,
        },
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      dispatch({ type: "SET_STATS", payload: { collections: 0, videos: 0 } });
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "stats", value: false } });
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const value = {
    ...state,
    loadDashboardData: loadStats,
    loadStats,
    dispatch,
    addActivity,
    getRecentActivities,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
