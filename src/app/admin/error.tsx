
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error secara internal untuk debugging
    console.error("Admin Page Error:", error);
  }, [error]);

  const isPermissionError = error.message.includes("permission") || error.message.includes("permissions");
  const isIndexError = error.message.includes("index") || error.message.includes("composite");

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Card className="max-w-xl w-full shadow-2xl border-destructive/20">
        <CardHeader className="text-center space-y-2">
          <div className="bg-destructive/10 h-16 w-16 rounded-full mx-auto flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Terjadi Kesalahan Sistem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto max-h-[200px] border">
            {error.message || "Kesalahan tidak diketahui pada sisi klien."}
          </div>
          
          {isIndexError && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm">
              <p className="font-bold text-primary mb-1">💡 Solusi:</p>
              <p>Firebase membutuhkan <b>Index</b> untuk menampilkan statistik. Silakan cek konsol browser (F12) dan klik tautan yang disediakan oleh Firebase untuk membuat index secara otomatis.</p>
            </div>
          )}

          {isPermissionError && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm">
              <p className="font-bold text-primary mb-1">💡 Solusi:</p>
              <p>Anda mungkin belum terdaftar sebagai <b>Guru</b> di database atau sesi login Anda telah berakhir. Silakan coba login ulang.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => router.push("/")}>
            <Home className="h-4 w-4" /> Beranda
          </Button>
          <Button className="flex-1 gap-2" onClick={() => reset()}>
            <RefreshCcw className="h-4 w-4" /> Coba Lagi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
