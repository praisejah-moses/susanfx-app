import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage or default to dark
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved || "dark";
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("theme", theme);

    // Apply theme to document
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-mode");
      root.classList.remove("dark-mode");
      root.style.setProperty("--background-default", "#ffffff");
      root.style.setProperty("--background-secondary", "#f8f9fa");
      root.style.setProperty("--background-tertiary", "#f0f0f0");
      root.style.setProperty("--background-card", "#fafafa");
      root.style.setProperty("--foreground-default", "#1a1a1a");
      root.style.setProperty("--border-normal", "#e0e0e0");
      root.style.setProperty("--strokes-default", "#cccccc");
      root.style.setProperty("--global-text", "#1a1a1a");
      root.style.setProperty("--text-white-50", "rgba(0, 0, 0, 0.5)");
    } else {
      root.classList.add("dark-mode");
      root.classList.remove("light-mode");
      root.style.setProperty("--background-default", "#000");
      root.style.setProperty("--background-secondary", "#000");
      root.style.setProperty("--background-tertiary", "#0a0a0a");
      root.style.setProperty("--background-card", "#0f0f0f");
      root.style.setProperty("--foreground-default", "#1a1a1a");
      root.style.setProperty("--border-normal", "#2a2a2a");
      root.style.setProperty("--strokes-default", "#2e2e2e");
      root.style.setProperty("--global-text", "#f5f5f5");
      root.style.setProperty("--text-white-50", "rgba(255, 255, 255, 0.5)");
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
