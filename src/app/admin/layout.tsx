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

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile Header (Hidden on Desktop) */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-50 w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
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

      {/* Desktop Sidebar (Fixed Width) */}
      <div className="hidden md:block w-72 shrink-0 h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-background/95 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
