import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex justify-start items-center"
    >
      {theme === "dark" ? (<><Sun className="mr-2" /></>

      ) : (<><Moon className="mr-2" /></>)}

    </div>
  )
}