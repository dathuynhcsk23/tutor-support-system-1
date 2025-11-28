import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ============================================
// Theme Types & Constants
// ============================================

const THEME_KEY = "theme";
const CUSTOM_THEME_KEY = "custom-theme";

export type ThemeMode = "light" | "dark";

export const AVAILABLE_THEMES = [
  {
    value: "default-light",
    label: "Default Light",
    mode: "light" as ThemeMode,
  },
  { value: "default-dark", label: "Default Dark", mode: "dark" as ThemeMode },
  { value: "caffein-light", label: "Caffein", mode: "light" as ThemeMode },
  { value: "catppuccin-dark", label: "Catppuccin", mode: "dark" as ThemeMode },
  { value: "claude-dark", label: "Claude", mode: "dark" as ThemeMode },
  {
    value: "clean-slate-light",
    label: "Clean Slate",
    mode: "light" as ThemeMode,
  },
  {
    value: "cosmic-night-dark",
    label: "Cosmic Night",
    mode: "dark" as ThemeMode,
  },
  { value: "graphite", label: "Graphite", mode: "dark" as ThemeMode },
  {
    value: "modern-minimal",
    label: "Modern Minimal",
    mode: "light" as ThemeMode,
  },
  {
    value: "university-light",
    label: "University",
    mode: "light" as ThemeMode,
  },
] as const;

export type CustomTheme = (typeof AVAILABLE_THEMES)[number]["value"];

// ============================================
// Theme Context
// ============================================

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  customTheme: CustomTheme;
  setCustomTheme: (theme: CustomTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================
// Helper Functions
// ============================================

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredCustomTheme(): CustomTheme {
  if (typeof window === "undefined") return "modern-minimal";

  const stored = window.localStorage.getItem(
    CUSTOM_THEME_KEY
  ) as CustomTheme | null;
  return stored || "modern-minimal";
}

// ============================================
// Theme Provider
// ============================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(getPreferredTheme);
  const [customTheme, setCustomThemeState] =
    useState<CustomTheme>(getStoredCustomTheme);

  // Apply theme mode to document
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    root.classList.remove(theme === "dark" ? "light" : "dark");
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Load custom theme CSS
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Remove any existing theme link
    const existingLink = document.getElementById("custom-theme-css");
    if (existingLink) {
      existingLink.remove();
    }

    // If it's not a default theme, load the CSS file
    if (!customTheme.startsWith("default-")) {
      const link = document.createElement("link");
      link.id = "custom-theme-css";
      link.rel = "stylesheet";
      link.href = `/shadcn_themes/${customTheme}.css`;
      document.head.appendChild(link);
    }

    window.localStorage.setItem(CUSTOM_THEME_KEY, customTheme);
  }, [customTheme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setCustomTheme = useCallback((next: CustomTheme) => {
    setCustomThemeState(next);
    // Automatically update the theme mode based on the selected custom theme
    const selectedTheme = AVAILABLE_THEMES.find((t) => t.value === next);
    if (selectedTheme) {
      setThemeState(selectedTheme.mode);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme, customTheme, setCustomTheme }),
    [theme, setTheme, toggleTheme, customTheme, setCustomTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
