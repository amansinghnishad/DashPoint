import { createContext, useContext, useReducer, useEffect } from "react";
import { stickyNotesAPI, todoAPI, weatherAPI } from "../services/api";

const DashboardContext = createContext();

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "SET_STICKY_NOTES":
      return { ...state, stickyNotes: action.payload };
    case "ADD_STICKY_NOTE":
      return {
        ...state,
        stickyNotes: [...state.stickyNotes, action.payload],
      };
    case "UPDATE_STICKY_NOTE":
      return {
        ...state,
        stickyNotes: state.stickyNotes.map((note) =>
          note._id === action.payload._id
            ? { ...note, ...action.payload }
            : note
        ),
      };
    case "DELETE_STICKY_NOTE":
      return {
        ...state,
        stickyNotes: state.stickyNotes.filter(
          (note) => note._id !== action.payload
        ),
      };
    case "SET_TODOS":
      return { ...state, todos: action.payload };
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };
    case "UPDATE_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo._id === action.payload._id
            ? { ...todo, ...action.payload }
            : todo
        ),
      };
    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo._id !== action.payload),
      };
    case "SET_WEATHER":
      return { ...state, weather: action.payload };
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
  stickyNotes: [],
  todos: [],
  weather: null,
  loading: {
    stickyNotes: false,
    todos: false,
    weather: false,
  },
  error: null,
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  // loadDashboardData function
  const loadDashboardData = async () => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "stickyNotes", value: true },
      });
      dispatch({ type: "SET_LOADING", payload: { key: "todos", value: true } }); // Load sticky notes from API
      try {
        const notesResponse = await stickyNotesAPI.getAll();
        if (notesResponse.success) {
          dispatch({ type: "SET_STICKY_NOTES", payload: notesResponse.data });
        }
      } catch (error) {
        console.error("Failed to load sticky notes:", error);
        dispatch({ type: "SET_STICKY_NOTES", payload: [] });
      }

      // Load todos from API
      try {
        const todosResponse = await todoAPI.getAll();
        if (todosResponse.success) {
          dispatch({ type: "SET_TODOS", payload: todosResponse.data });
        }
      } catch (error) {
        console.error("Failed to load todos:", error);
        dispatch({ type: "SET_TODOS", payload: [] });
      }

      dispatch({
        type: "SET_LOADING",
        payload: { key: "stickyNotes", value: false },
      });
      dispatch({
        type: "SET_LOADING",
        payload: { key: "todos", value: false },
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  }; // saveStickyNote function
  const saveStickyNote = async (note) => {
    try {
      if (note._id) {
        // Update existing note
        const response = await stickyNotesAPI.update(note._id, note);
        if (response.success) {
          dispatch({ type: "UPDATE_STICKY_NOTE", payload: response.data });
        }
      } else {
        // Create new note
        const response = await stickyNotesAPI.create(note);
        if (response.success) {
          dispatch({ type: "ADD_STICKY_NOTE", payload: response.data });
        }
      }
    } catch (error) {
      console.error("Failed to save sticky note:", error);
      throw error;
    }
  };

  // deleteStickyNote function
  const deleteStickyNote = async (id) => {
    try {
      const response = await stickyNotesAPI.delete(id);
      if (response.success) {
        dispatch({ type: "DELETE_STICKY_NOTE", payload: id });
      }
    } catch (error) {
      console.error("Failed to delete sticky note:", error);
      throw error;
    }
  };
  // saveTodo function
  const saveTodo = async (todo) => {
    try {
      if (todo._id) {
        // Update existing todo
        const response = await todoAPI.update(todo._id, todo);
        if (response.success) {
          dispatch({ type: "UPDATE_TODO", payload: response.data });
        }
      } else {
        // Create new todo
        const response = await todoAPI.create(todo);
        if (response.success) {
          dispatch({ type: "ADD_TODO", payload: response.data });
        }
      }
    } catch (error) {
      console.error("Failed to save todo:", error);
      throw error;
    }
  };

  // deleteTodo function
  const deleteTodo = async (id) => {
    try {
      const response = await todoAPI.delete(id);
      if (response.success) {
        dispatch({ type: "DELETE_TODO", payload: id });
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
      throw error;
    }
  };
  // toggleTodo function
  const toggleTodo = async (id) => {
    const todo = state.todos.find((t) => t._id === id);
    if (todo) {
      const updatedTodo = { ...todo, completed: !todo.completed };
      await saveTodo(updatedTodo);
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
    saveStickyNote,
    deleteStickyNote,
    saveTodo,
    deleteTodo,
    toggleTodo,
    setWeather,
    loadWeather,
    dispatch,
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
