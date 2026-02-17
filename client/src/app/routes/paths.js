export const APP_ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
});

export const PUBLIC_ONLY_ROUTES = new Set([
  APP_ROUTES.HOME,
  APP_ROUTES.LOGIN,
  APP_ROUTES.REGISTER,
]);
