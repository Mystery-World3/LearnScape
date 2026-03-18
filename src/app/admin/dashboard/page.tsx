"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Target, BookOpen, Clock, TrendingUp, Loader2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from "recharts";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup } from "firebase/firestore";
import { QuizResult, Class } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes, isLoading: classesLoading, error: classesError } = useCollection<Class>(classesQuery);

  const resultsQuery = useMemoFirebase(() => collectionGroup(firestore, "quizAttempts"), [firestore]);
  const { data: results, isLoading: resultsLoading, error: resultsError } = useCollection<QuizResult>(resultsQuery);

  const isLoading = !mounted || classesLoading || resultsLoading;
  const hasError = !!classesError || !!resultsError;

  const safeResults = useMemo(() => Array.isArray(results) ? results : [], [results]);
  const safeClasses = useMemo(() => Array.isArray(classes) ? classes : [], [classes]);

  const totalParticipants = safeResults.length;
  const avgScore = useMemo(() => {
    if (totalParticipants === 0) return 0;
    try {
      const total = safeResults.reduce((acc, curr) => acc + (Number(curr?.score) || 0), 0);
      return Math.round(total / totalParticipants);
    } catch (e) {
      return 0;
    }
  }, [safeResults, totalParticipants]);
  
  const classStats = useMemo(() => {
    if (!safeClasses.length) return [];
    return safeClasses.map(c => {
      try {
        const classResults = safeResults.filter(r => r?.classId === c?.id);
        const totalScore = classResults.reduce((acc, curr) => acc + (Number(curr?.score) || 0), 0);
        return {
          name: c?.name || "Materi",
          count: classResults.length,
          avg: classResults.length ? Math.round(totalScore / classResults.length) : 0
        };
      } catch (e) {
        return { name: c?.name || "Error", count: 0, avg: 0 };
      }
    });
  }, [safeClasses, safeResults]);

  const sortedRecentResults = useMemo(() => {
    if (!safeResults.length) return [];
    return [...safeResults]
      .filter(r => r && r.timestamp && !isNaN(new Date(r.timestamp).getTime()))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [safeResults]);

  const COLORS = ['#3b49df', '#facc15', '#10b981', '#f43f5e', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="font-medium text-lg">Menyiapkan dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">Ringkasan Statistik</h1>
          <p className="text-muted-foreground">Monitor performa siswa dan aktivitas kuis secara real-time.</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-bold text-primary">Sistem Online</span>
        </div>
      </div>

      {hasError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">Informasi Database</AlertTitle>
          <AlertDescription>
            {classesError?.message.includes("index") || resultsError?.message.includes("index") 
              ? "Firebase membutuhkan Index untuk query gabungan. Silakan cek konsol browser (F12) untuk link pembuatan index otomatis."
              : "Terjadi kendala saat memuat data. Pastikan koneksi internet stabil."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <Users className="h-8 w-8 opacity-40 mb-2" />
            <CardTitle className="text-4xl font-headline">{totalParticipants}</CardTitle>
            <CardDescription className="text-primary-foreground/70 font-medium">Total Peserta</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-accent text-accent-foreground">
          <CardHeader className="pb-2">
            <Target className="h-8 w-8 opacity-40 mb-2" />
            <CardTitle className="text-4xl font-headline">{avgScore}%</CardTitle>
            <CardDescription className="text-accent-foreground/70 font-medium">Rata-rata Skor</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-card">
          <CardHeader className="pb-2">
            <BookOpen className="h-8 w-8 text-primary opacity-40 mb-2" />
            <CardTitle className="text-4xl font-headline">{safeClasses.length}</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">Materi Aktif</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-card">
          <CardHeader className="pb-2">
            <TrendingUp className="h-8 w-8 text-accent opacity-40 mb-2" />
            <CardTitle className="text-4xl font-headline">Live</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">Koneksi Database</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Skor Rata-rata per Kelas (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
             {classStats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                      {classStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                 Belum ada data nilai.
               </div>
             )}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Distribusi Peserta</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
             {classStats.some(s => s.count > 0) ? (
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classStats}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name}
                      fontSize={10}
                    >
                      {classStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                 Belum ada data partisipasi.
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Aktivitas Terakhir</CardTitle>
          <CardDescription>Daftar 5 siswa yang baru saja menyelesaikan kuis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedRecentResults.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                    {r?.studentName ? r.studentName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{r?.studentName || "Siswa"}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {safeClasses.find(c => c.id === r.classId)?.name || "Kuis"} • {r?.timestamp ? new Date(r.timestamp).toLocaleDateString('id-ID') : "-"}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <Badge className={cn((Number(r?.score) || 0) >= 70 ? "bg-primary" : "bg-destructive")}>
                    {r?.score || 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {sortedRecentResults.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic bg-secondary/20 rounded-2xl border border-dashed">
                Belum ada aktivitas kuis terbaru.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
