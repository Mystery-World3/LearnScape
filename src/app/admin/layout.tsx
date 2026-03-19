
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Menu, GraduationCap, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useFirebase } from "@/firebase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdminLoggedIn] = useLocalStorage<boolean>("is_admin_logged_in", false);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useFirebase();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAdminLoggedIn && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [mounted, isAdminLoggedIn, pathname, router]);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  // Jika di halaman login, tampilkan tanpa sidebar
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Jika belum login (dan bukan halaman login), jangan tampilkan apapun dulu
  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-headline font-black text-xl tracking-tight text-primary">LearnScape</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10 rounded-full">
            {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none">
              <AdminSidebar isMobile />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 p-4 md:p-8 bg-background/95 overflow-y-auto md:h-screen scrollbar-hide">
        <div className="max-w-6xl mx-auto pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
