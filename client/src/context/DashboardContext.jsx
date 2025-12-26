import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  weatherAPI,
  collectionsAPI,
  contentAPI,
  youtubeAPI,
} from "../services/api";
import { useActivity } from "../hooks/useActivity";

const DashboardContext = createContext();

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "SET_WEATHER":
      return { ...state, weather: action.payload };
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
  weather: null,
  stats: {
    collections: 0,
    content: 0,
    videos: 0,
  },
  loading: {
    weather: false,
    stats: false,
  },
  error: null,
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { addActivity, getRecentActivities } = useActivity();

  // loadStats function
  const loadStats = useCallback(async () => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "stats", value: true },
      });
      const [collectionsRes, contentRes, videosRes] = await Promise.all([
        collectionsAPI.getCollections(1, 1),
        contentAPI.getAll(1, 1),
        youtubeAPI.getAll(1, 1),
      ]);

      const stats = {
        collections: collectionsRes.success
          ? collectionsRes.data?.pagination?.total || 0
          : 0,
        content: contentRes.success ? contentRes.pagination?.total || 0 : 0,
        videos: videosRes.success ? videosRes.pagination?.total || 0 : 0,
      };

      dispatch({ type: "SET_STATS", payload: stats });
    } catch (error) {
      console.error("Failed to load stats:", error);
      dispatch({
        type: "SET_STATS",
        payload: { collections: 0, content: 0, videos: 0 },
      });
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "stats", value: false },
      });
    }
  }, []);

  // loadDashboardData function
  const loadDashboardData = async () => {
    try {
      // Load stats
      await loadStats();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  // setWeather function
  const setWeather = (weatherData) => {
    dispatch({ type: "SET_WEATHER", payload: weatherData });
  };

  // loadWeather function
  const loadWeather = async (location) => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "weather", value: true },
      });
      const response = await weatherAPI.getCurrent(location);
      if (response.success) {
        dispatch({ type: "SET_WEATHER", payload: response.data });
      }
    } catch (error) {
      console.error("Failed to load weather:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "weather", value: false },
      });
    }
  };

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);
  const value = {
    ...state,
    loadDashboardData,
    loadStats,
    setWeather,
    loadWeather,
    dispatch,
    addActivity,
    getRecentActivities,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
