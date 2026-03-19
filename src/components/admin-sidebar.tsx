"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  HelpCircle, 
  LogOut,
  GraduationCap,
  Trophy,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Manajemen Kelas", icon: BookOpen, href: "/admin/classes" },
  { label: "Manajemen Soal", icon: HelpCircle, href: "/admin/questions" },
  { label: "Manajemen Nilai", icon: Trophy, href: "/admin/results" },
];

export function AdminSidebar({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [_, setIsAdminLoggedIn] = useLocalStorage<boolean>("is_admin_logged_in", false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    router.push("/");
  };

  const content = (
    <div className={cn(
      "h-full bg-card flex flex-col",
      !isMobile && "w-64 border-r fixed left-0 top-0 z-50"
    )}>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">LearnScape</span>
        </Link>
        <div className="mt-2 px-1 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Admin Panel</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={toggleTheme}>
             {theme === "light" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              pathname === item.href 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Keluar (View Siswa)
        </Button>
      </div>
    </div>
  );

  return content;
}
