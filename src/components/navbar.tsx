
"use client";

import Link from "next/link";
import { GraduationCap, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/admin/login" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg transition-transform group-hover:scale-110">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">LearnScape</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-full border">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-full", theme === "light" && "bg-background shadow-sm")}
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-full", theme === "system" && "bg-background shadow-sm")}
            onClick={() => setTheme("system")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-full", theme === "dark" && "bg-background shadow-sm")}
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
