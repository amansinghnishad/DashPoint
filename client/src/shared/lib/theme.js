const STORAGE_KEY = "dashpoint-theme";

const BODY_BASE_CLASSES = ["antialiased"];
const BODY_THEME_CLASSES = {
  dark: ["bg-slate-950", "text-white"],
  light: ["bg-white", "text-slate-900"],
};

function applyBodyClasses(theme) {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (!body) return;

  body.classList.add(...BODY_BASE_CLASSES);

  // Remove any theme classes then add the active ones.
  body.classList.remove(...BODY_THEME_CLASSES.dark, ...BODY_THEME_CLASSES.light);
  body.classList.add(...BODY_THEME_CLASSES[theme]);
}

/**
 * @returns {'dark'|'light'}
 */
export function getPreferredTheme() {
  const stored =
    typeof window !== "undefined"
      ? window.localStorage?.getItem(STORAGE_KEY)
      : null;

  if (stored === "dark" || stored === "light") return stored;

  // Default to dark to match the current product theme.
  return "dark";
}

/**
 * Apply theme to the document root.
 * @param {'dark'|'light'} theme
 */
export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  applyBodyClasses(theme);

  try {
    window.dispatchEvent(
      new CustomEvent("dashpoint-theme-change", { detail: { theme } })
    );
  } catch {
    // no-op
  }
}

/**
 * Initialize theme on app startup.
 */
export function initTheme() {
  applyTheme(getPreferredTheme());
}

/**
 * Persist and apply a theme.
 * @param {'dark'|'light'} theme
 */
export function setTheme(theme) {
  if (typeof window !== "undefined") {
    window.localStorage?.setItem(STORAGE_KEY, theme);
  }
  applyTheme(theme);
}

export const THEME_STORAGE_KEY = STORAGE_KEY;
