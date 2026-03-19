"use client";

import Link from "next/link";
import { GraduationCap, Moon, Sun, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";

export function Navbar() {
  const { theme, toggleTheme } = useFirebase();

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

      <div className="flex items-center gap-4 md:gap-8">
        <Link 
          href="/admin/login" 
          className="hidden md:flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <ShieldCheck className="h-4 w-4 group-hover:animate-bounce" />
          Panel Guru
        </Link>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-secondary/50 h-10 w-10 hover:bg-primary/20 transition-colors"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Link href="/admin/login" className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 h-10 w-10">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
