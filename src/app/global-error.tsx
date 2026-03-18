'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global App Error:', error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter">Terjadi Kesalahan Fatal</h2>
          <p className="text-muted-foreground">
            Aplikasi mengalami kendala teknis yang tidak terduga. Silakan coba muat ulang halaman.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              Muat Ulang Halaman
            </Button>
            <Button variant="outline" onClick={() => reset()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
