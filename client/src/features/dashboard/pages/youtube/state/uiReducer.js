export const UI_INITIAL_STATE = {
  addToCollectionItem: null,
  deleteItem: null,
  isDeleting: false,
  isAdding: false,
  urlInput: "",
  isLoading: false,
};

export function uiReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ADDING":
      return { ...state, isAdding: action.payload };
    case "SET_URL":
      return { ...state, urlInput: action.payload };
    case "RESET_ADD_FORM":
      return { ...state, isAdding: false, urlInput: "" };
    case "OPEN_ADD_COLLECTION":
      return { ...state, addToCollectionItem: action.payload };
    case "CLOSE_ADD_COLLECTION":
      return { ...state, addToCollectionItem: null };
    case "OPEN_DELETE":
      return { ...state, deleteItem: action.payload };
    case "CLOSE_DELETE":
      return { ...state, deleteItem: null };
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload };
    default:
      return state;
  }
}
