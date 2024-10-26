import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import TSWIcon from "./TSWIcon";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      type="button"
    >
      <TSWIcon>
        {theme === "dark" ? (
          <>
            <Sun size={24} />
          </>
        ) : (
          <>
            <Moon size={24} />
          </>
        )}
      </TSWIcon>
    </button>
  );
}
