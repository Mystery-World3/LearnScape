"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdminLoggedIn] = useLocalStorage<boolean>("is_admin_logged_in", false);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

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
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 bg-background/95 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
