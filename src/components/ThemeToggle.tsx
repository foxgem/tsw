import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import IconWrapper from "./IconWrapper";

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
      <IconWrapper>
        {theme === "dark" ? (
          <>
            <Sun size={24} />
          </>
        ) : (
          <>
            <Moon size={24} />
          </>
        )}
      </IconWrapper>
    </button>
  );
}
