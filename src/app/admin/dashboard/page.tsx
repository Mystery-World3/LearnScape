
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Target, BookOpen, Clock, TrendingUp, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup } from "firebase/firestore";
import { QuizResult, Class } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes, isLoading: classesLoading } = useCollection<Class>(classesQuery);

  const resultsQuery = useMemoFirebase(() => collectionGroup(firestore, "quizAttempts"), [firestore]);
  const { data: results, isLoading: resultsLoading } = useCollection<QuizResult>(resultsQuery);

  const isLoading = classesLoading || resultsLoading;

  // Safe data extraction
  const safeResults = results || [];
  const safeClasses = classes || [];

  const totalParticipants = safeResults.length;
  const avgScore = totalParticipants 
    ? Math.round(safeResults.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalParticipants) 
    : 0;
  
  const classStats = safeClasses.map(c => {
    const classResults = safeResults.filter(r => r.classId === c.id);
    return {
      name: c.name,
      count: classResults.length,
      avg: classResults.length ? Math.round(classResults.reduce((acc, curr) => acc + (curr.score || 0), 0) / classResults.length) : 0
    };
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  // Prevent hydration mismatch for charts and dates
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="font-medium">Menyiapkan dashboard statistik...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">Ringkasan Statistik</h1>
          <p className="text-muted-foreground">Monitor performa siswa dan aktivitas kuis secara real-time.</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-primary">Live Update</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <Users className="h-8 w-8 opacity-50 mb-2" />
            <CardTitle className="text-4xl font-headline">{totalParticipants}</CardTitle>
            <CardDescription className="text-primary-foreground/70 font-medium">Total Peserta Kuis</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-accent text-accent-foreground">
          <CardHeader className="pb-2">
            <Target className="h-8 w-8 opacity-50 mb-2" />
            <CardTitle className="text-4xl font-headline">{avgScore}%</CardTitle>
            <CardDescription className="text-accent-foreground/70 font-medium">Rata-rata Skor</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <BookOpen className="h-8 w-8 text-primary opacity-50 mb-2" />
            <CardTitle className="text-4xl font-headline text-foreground">{safeClasses.length}</CardTitle>
            <CardDescription className="font-medium">Kelas Aktif</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <TrendingUp className="h-8 w-8 text-accent opacity-50 mb-2" />
            <CardTitle className="text-4xl font-headline text-foreground">Online</CardTitle>
            <CardDescription className="font-medium">Status Koneksi</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Distribusi Skor per Kelas</CardTitle>
            <CardDescription>Perbandingan nilai rata-rata tiap mata pelajaran (%)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {classStats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                      {classStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                 Belum ada data skor untuk ditampilkan.
               </div>
             )}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Populasi Siswa</CardTitle>
            <CardDescription>Jumlah partisipasi siswa berdasarkan kelas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
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
                      label={({ name, percent }) => {
                        const pct = typeof percent === 'number' ? (percent * 100).toFixed(0) : '0';
                        return `${name} ${pct}%`;
                      }}
                      fontSize={10}
                    >
                      {classStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                 Belum ada data populasi untuk ditampilkan.
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
            {safeResults
              .filter(r => !!r.timestamp)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 5)
              .map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                    {r.studentName ? r.studentName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{r.studentName || "Siswa Tanpa Nama"}</div>
                    <div className="text-xs text-muted-foreground">
                      {safeClasses.find(c => c.id === r.classId)?.name || "Kelas N/A"} • {r.timestamp ? new Date(r.timestamp).toLocaleDateString('id-ID') : "-"}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge className={cn((r.score || 0) >= 70 ? "bg-primary" : "bg-destructive")}>
                    {r.score || 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {safeResults.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic bg-secondary/20 rounded-2xl border border-dashed">
                Belum ada aktivitas kuis yang tercatat.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
