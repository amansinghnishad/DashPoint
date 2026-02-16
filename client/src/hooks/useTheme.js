import { useCallback, useEffect, useState } from "react";
import { getPreferredTheme, setTheme } from "../shared/lib/theme";

const THEME_EVENT = "dashpoint-theme-change";

export default function useTheme() {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    setThemeState(getPreferredTheme());

    const onThemeChange = (e) => {
      const next = e?.detail?.theme;
      if (next === "dark" || next === "light") setThemeState(next);
    };

    window.addEventListener(THEME_EVENT, onThemeChange);

    const onStorage = (e) => {
      if (e.key !== "dashpoint-theme") return;
      setThemeState(getPreferredTheme());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }, [theme]);

  return { theme, isLight: theme === "light", toggleTheme, setTheme };
}
