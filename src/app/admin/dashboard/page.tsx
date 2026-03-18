"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Target, BookOpen, Clock, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { QuizResult, Class } from "@/lib/types";
import { MOCK_RESULTS, MOCK_CLASSES } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [results] = useLocalStorage<QuizResult[]>("quiz_results", MOCK_RESULTS);
  const [classes] = useLocalStorage<Class[]>("classes", MOCK_CLASSES);

  const totalParticipants = results.length;
  const avgScore = results.length ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length) : 0;
  
  const classStats = classes.map(c => {
    const classResults = results.filter(r => r.classId === c.id);
    return {
      name: c.name,
      count: classResults.length,
      avg: classResults.length ? Math.round(classResults.reduce((acc, curr) => acc + curr.score, 0) / classResults.length) : 0
    };
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-bold">Ringkasan Statistik</h1>
          <p className="text-muted-foreground">Monitor performa siswa dan aktivitas kuis secara real-time.</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-primary">Update: Hari Ini, {new Date().toLocaleTimeString()}</span>
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
            <CardDescription className="text-accent-foreground/70 font-medium">Rata-rata Skor Nasional</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <BookOpen className="h-8 w-8 text-primary opacity-50 mb-2" />
            <CardTitle className="text-4xl font-headline text-foreground">{classes.length}</CardTitle>
            <CardDescription className="font-medium">Kelas Aktif</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <TrendingUp className="h-8 w-8 text-accent opacity-50 mb-2" />
            <CardTitle className="text-4xl font-headline text-foreground">+12%</CardTitle>
            <CardDescription className="font-medium">Pertumbuhan Minggu Ini</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Distribusi Skor per Kelas</CardTitle>
            <CardDescription>Perbandingan nilai rata-rata tiap mata pelajaran</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classStats}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {classStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Populasi Siswa</CardTitle>
            <CardDescription>Jumlah partisipasi siswa berdasarkan kelas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classStats}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {classStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
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
            {results.slice(-5).reverse().map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {r.studentName ? r.studentName.charAt(0) : "?"}
                  </div>
                  <div>
                    <div className="font-bold">{r.studentName || "Siswa Tanpa Nama"}</div>
                    <div className="text-xs text-muted-foreground">
                      {classes.find(c => c.id === r.classId)?.name} • {new Date(r.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={cn(r.score >= 70 ? "bg-primary" : "bg-destructive")}>
                    {r.score}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
