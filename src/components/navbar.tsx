"use client";

import Link from "next/link";
import { GraduationCap, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";

export function Navbar() {
  const { theme, toggleTheme } = useFirebase();

  return (
    <nav className="w-full px-6 md:px-12 h-20 flex items-center justify-between bg-transparent z-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 group">
          {/* Ikon Topi Wisuda mengarah ke Beranda (Siswa) */}
          <Link href="/" className="bg-primary p-2 rounded-lg transition-transform group-hover:scale-110 active:scale-95">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </Link>
          
          {/* Teks LearnScape mengarah ke Panel Guru (Pintu Masuk Tersembunyi) */}
          <Link href="/admin/login" className="font-headline font-bold text-2xl tracking-tight text-primary hover:opacity-80 transition-opacity">
            Learn<span className="text-accent">Scape</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-secondary/50 h-10 w-10 hover:bg-primary/20 transition-colors shadow-sm"
          onClick={toggleTheme}
          title="Ganti Tema"
        >
          {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </nav>
);
}
