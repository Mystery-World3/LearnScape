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
import { useFirebase } from "@/firebase";

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
  const { theme, toggleTheme } = useFirebase();

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    router.push("/");
  };

  const content = (
    <div className={cn(
      "h-full bg-card flex flex-col border-r shadow-sm",
      !isMobile && "fixed w-72 left-0 top-0 z-50"
    )}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-headline font-black text-2xl tracking-tighter text-foreground">
              Learn<span className="text-primary">Scape</span>
            </span>
          </Link>
        </div>
        <div className="px-1 flex items-center justify-between mt-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Administrator</span>
          {!isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/50" onClick={toggleTheme}>
              {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      <Separator className="opacity-50" />

      <nav className="flex-1 p-6 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold text-sm",
              pathname === item.href 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", pathname === item.href ? "opacity-100" : "opacity-60")} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-4 px-5 py-4 rounded-xl transition-all font-black text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Keluar Panel
        </Button>
      </div>
    </div>
  );

  return content;
}
