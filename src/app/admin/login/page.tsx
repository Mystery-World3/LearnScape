
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Siswa
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="bg-primary h-16 w-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold">Akses Pengajar</CardTitle>
            <CardDescription>Masukkan kode akses administrator untuk masuk</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Administrator</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password..."
                  className="pl-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg font-bold">
              Masuk Dashboard
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
