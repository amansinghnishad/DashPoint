/* global __APP_VERSION__, __APP_COMMIT__, __APP_BUILT_AT__ */

export const BUILD_INFO = Object.freeze({
  version: typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0-dev",
  commit: typeof __APP_COMMIT__ === "string" ? __APP_COMMIT__ : "local",
  builtAt: typeof __APP_BUILT_AT__ === "string" ? __APP_BUILT_AT__ : "unknown",
});
