export const SEARCH_INITIAL_STATE = {
  query: "",
  results: [],
  isLoading: false,
  error: null,
};

export function searchReducer(state, action) {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: typeof action.payload === "string" ? action.payload : "" };
    case "RESET":
      return { ...state, results: [], isLoading: false, error: null };
    case "START":
      return { ...state, isLoading: true, error: null };
    case "SUCCESS":
      return {
        ...state,
        results: Array.isArray(action.payload) ? action.payload : [],
        isLoading: false,
        error: null,
      };
    case "FAIL": {
      const error =
        typeof action.payload === "string" && action.payload.trim()
          ? action.payload
          : "YouTube search failed. Please try again.";
      return { ...state, results: [], isLoading: false, error };
    }
    default:
      return state;
  }
}
