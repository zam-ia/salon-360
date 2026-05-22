"use client";

import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");
    }

    const handleThemeChange = () => {
      const isL = document.documentElement.classList.contains("light");
      setTheme(isL ? "light" : "dark");
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(nextTheme);
      localStorage.setItem("theme", nextTheme);
      window.dispatchEvent(new Event("themeChanged"));
    }
  };

  return (
    <div 
      onClick={toggleTheme}
      className="relative w-20 h-10 rounded-full bg-slate-200/50 dark:bg-[#1A1A1A]/60 backdrop-blur-md border border-slate-300 dark:border-white/10 flex items-center justify-between px-2 cursor-pointer shadow-inner select-none transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {/* Sliding Glassmorphism lens handle (Frosted circle from the image design style) */}
      <div 
        className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-lg border border-white/50 dark:border-white/20 shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === "light" 
            ? "transform translate-x-0" 
            : "transform translate-x-10"
        }`}
      />

      {/* Sun Icon (Left position) */}
      <div className="relative z-10 w-8 h-8 flex items-center justify-center">
        <Sun 
          size={16} 
          className={`transition-all duration-300 ${
            theme === "light" 
              ? "text-amber-500 scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" 
              : "text-slate-400 dark:text-slate-500"
          }`} 
        />
      </div>

      {/* Moon Icon (Right position) */}
      <div className="relative z-10 w-8 h-8 flex items-center justify-center">
        <Moon 
          size={16} 
          className={`transition-all duration-300 ${
            theme === "dark" 
              ? "text-[#D23369] scale-110 drop-shadow-[0_0_8px_rgba(210,51,105,0.6)]" 
              : "text-slate-500 dark:text-slate-400"
          }`} 
        />
      </div>
    </div>
  );
}
