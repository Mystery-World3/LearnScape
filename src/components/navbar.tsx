"use client";

import Link from "next/link";
import { GraduationCap, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function Navbar() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("app-theme", "light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="w-full px-6 md:px-12 h-20 flex items-center justify-between bg-transparent z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg transition-transform group-hover:scale-110">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight text-primary">
            Learn<span className="text-accent">Scape</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <span className="hidden md:block text-sm italic text-muted-foreground font-medium">
          Interactive Digital Learning Platform
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-secondary/50 h-10 w-10 hover:bg-primary/20 transition-colors"
          onClick={toggleTheme}
        >
          {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </nav>
  );
}
