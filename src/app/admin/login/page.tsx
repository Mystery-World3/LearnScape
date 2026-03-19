
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, Lock, Sun, Moon, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useFirebase } from "@/firebase";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [_, setIsAdminLoggedIn] = useLocalStorage<boolean>("is_admin_logged_in", false);
  const router = useRouter();
  const { toast } = useToast();
  const { theme, toggleTheme } = useFirebase();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Password admin default: admin123
    if (password === "admin123") {
      setIsAdminLoggedIn(true);
      toast({
        title: "Login Berhasil",
        description: "Selamat datang di Dashboard Pengajar.",
      });
      router.push("/admin/dashboard");
    } else {
      toast({
        title: "Login Gagal",
        description: "Password salah. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={() => router.push("/")} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Siswa
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full bg-secondary/50 h-10 w-10">
            {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <Card className="shadow-2xl border-primary/10 rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur-md">
          <CardHeader className="text-center space-y-6 pt-10">
            <div className="flex justify-center">
              <div className="bg-primary p-4 rounded-3xl shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
                <GraduationCap className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl md:text-4xl font-headline font-black tracking-tight text-foreground">
                Learn<span className="text-primary">Scape</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Panel Kontrol Pengajar & Administrator
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-black uppercase tracking-widest ml-1 opacity-70">
                  Password Akses
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password..."
                    className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary/20 text-lg font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-10 pt-4">
              <Button type="submit" className="w-full h-14 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                Masuk Sekarang
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground font-medium opacity-50">
            © 2024 LearnScape Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}
