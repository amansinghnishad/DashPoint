export const AuthActionType = Object.freeze({
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  CLEAR_ERROR: "CLEAR_ERROR",
  SESSION_WARNING: "SESSION_WARNING",
  SET_FIRST_TIME_USER: "SET_FIRST_TIME_USER",
});

export const initialAuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  sessionWarning: false,
  isFirstTimeUser: false,
};

export default function authReducer(state, action) {
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
