"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Target, BookOpen, TrendingUp, Loader2, AlertTriangle, CheckCircle2, Filter, HelpCircle, ListChecks } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup } from "firebase/firestore";
import { QuizResult, Class, Question } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [filterClassId, setFilterClassId] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes, isLoading: classesLoading, error: classesError } = useCollection<Class>(classesQuery);

  const resultsQuery = useMemoFirebase(() => collectionGroup(firestore, "quizAttempts"), [firestore]);
  const { data: results, isLoading: resultsLoading, error: resultsError } = useCollection<QuizResult>(resultsQuery);

  const questionsQuery = useMemoFirebase(() => collectionGroup(firestore, "questions"), [firestore]);
  const { data: allQuestions, isLoading: questionsLoading, error: questionsError } = useCollection<Question>(questionsQuery);

  const isLoading = !mounted || classesLoading || resultsLoading || questionsLoading;
  const hasError = !!classesError || !!resultsError || !!questionsError;

  const safeResults = useMemo(() => Array.isArray(results) ? results : [], [results]);
  const safeClasses = useMemo(() => Array.isArray(classes) ? classes : [], [classes]);
  const safeQuestions = useMemo(() => Array.isArray(allQuestions) ? allQuestions : [], [allQuestions]);

  const filteredResults = useMemo(() => {
    if (filterClassId === "all") return safeResults;
    return safeResults.filter(r => r.classId === filterClassId);
  }, [safeResults, filterClassId]);

  const totalParticipants = filteredResults.length;
  const totalQuestions = safeQuestions.length;
  const activeClassesCount = safeClasses.filter(c => c.isActive).length;

  const avgScore = useMemo(() => {
    if (totalParticipants === 0) return 0;
    const total = filteredResults.reduce((acc, curr) => acc + (Number(curr?.score) || 0), 0);
    return Math.round(total / totalParticipants);
  }, [filteredResults, totalParticipants]);
  
  const classStats = useMemo(() => {
    if (!safeClasses.length) return [];
    const baseStats = safeClasses.map(c => {
      const classResults = safeResults.filter(r => r?.classId === c?.id);
      const classQuestionsCount = safeQuestions.filter(q => q.classId === c.id).length;
      const totalScore = classResults.reduce((acc, curr) => acc + (Number(curr?.score) || 0), 0);
      return {
        id: c.id,
        name: c?.name || "Materi",
        isActive: c.isActive,
        count: classResults.length,
        questionCount: classQuestionsCount,
        avg: classResults.length ? Math.round(totalScore / classResults.length) : 0
      };
    });

    if (filterClassId === "all") return baseStats;
    return baseStats.filter(s => s.id === filterClassId);
  }, [safeClasses, safeResults, safeQuestions, filterClassId]);

  const sortedRecentResults = useMemo(() => {
    if (!filteredResults.length) return [];
    return [...filteredResults]
      .filter(r => r && r.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [filteredResults]);

  const COLORS = ['#3b49df', '#facc15', '#10b981', '#f43f5e', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="font-medium text-lg">Menghubungkan ke Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-bold">Ringkasan Statistik</h1>
          <p className="text-muted-foreground">Monitor performa siswa dan ketersediaan soal secara real-time.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 bg-card p-2 rounded-xl border shadow-sm w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground ml-2" />
            <Select value={filterClassId} onValueChange={setFilterClassId}>
              <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {safeClasses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive border-l-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">Konfigurasi Database Diperlukan</AlertTitle>
          <AlertDescription>
            Terjadi kendala saat memuat data. Periksa konsol browser (F12) untuk melihat apakah ada Index Firebase yang perlu diaktifkan.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12">
            <Users size={120} />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-5xl font-headline">{totalParticipants}</CardTitle>
            <CardDescription className="text-primary-foreground font-bold opacity-80">Peserta Terfilter</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl bg-accent text-accent-foreground overflow-hidden relative">
          <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12">
            <HelpCircle size={120} />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-5xl font-headline">{totalQuestions}</CardTitle>
            <CardDescription className="text-accent-foreground font-bold opacity-80">Total Soal</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border shadow-xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-5xl font-headline text-primary">
              {activeClassesCount}
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">Materi Aktif</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border shadow-xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-5xl font-headline text-[#facc15]">
              {avgScore}%
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">Rata-rata Skor</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-2xl bg-card border">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performa Nilai (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
             {classStats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
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

        <Card className="shadow-2xl bg-card border overflow-hidden">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Detail Soal per Kelas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead className="text-right">Soal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStats.filter(s => s.isActive).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-xs">{s.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{s.questionCount}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {classStats.filter(s => s.isActive).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10 text-muted-foreground italic text-xs">
                      Tidak ada kelas aktif.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-2xl bg-card border overflow-hidden">
        <CardHeader className="bg-secondary/30 border-b">
          <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Aktivitas Terakhir
          </CardTitle>
          <CardDescription>Siswa yang baru saja menyelesaikan kuis</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedRecentResults.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between p-5 hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 border border-primary/20">
                    {r?.studentName ? r.studentName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-lg leading-tight truncate">{r?.studentName || "Siswa"}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {safeClasses.find(c => c.id === r.classId)?.name || "Kuis"} • {r?.timestamp ? new Date(r.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : "-"}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <Badge className={cn("text-lg px-4 py-1", (Number(r?.score) || 0) >= 70 ? "bg-green-500 text-white" : "bg-destructive text-white")}>
                    {r?.score || 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {sortedRecentResults.length === 0 && (
              <div className="text-center py-20 text-muted-foreground italic">
                Belum ada aktivitas kuis terbaru.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
