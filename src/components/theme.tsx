import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0B1120" : "#F8FAFC");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("ats-theme") as Theme | null) ?? systemTheme();
    setTheme(saved);
    applyTheme(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (!localStorage.getItem("ats-theme")) {
        const next = systemTheme();
        setTheme(next);
        applyTheme(next);
      }
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("ats-theme", next);
    setTheme(next);
    applyTheme(next);
  };

  return { theme, toggle };
}
