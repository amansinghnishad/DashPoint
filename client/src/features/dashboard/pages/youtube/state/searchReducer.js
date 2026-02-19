export const SEARCH_INITIAL_STATE = {
  query: "",
  results: [],
  isLoading: false,
  error: null,
};

export function searchReducer(state, action) {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "RESET":
      return { ...state, results: [], isLoading: false, error: null };
    case "START":
      return { ...state, isLoading: true, error: null };
    case "SUCCESS":
      return {
        ...state,
        results: action.payload,
        isLoading: false,
        error: null,
      };
    case "FAIL":
      return { ...state, results: [], isLoading: false, error: action.payload };
    default:
      return state;
  }
}
