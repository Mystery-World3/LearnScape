"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TrendingUp, Loader2, AlertTriangle, CheckCircle2, Filter, ListChecks } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center h-[70vh] text-muted-foreground animate-fade-in">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <p className="font-headline font-bold text-xl">Mempersiapkan Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black tracking-tight">Ringkasan Statistik</h1>
          <p className="text-muted-foreground font-medium">Monitor performa siswa secara real-time.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border-2 shadow-sm w-full sm:w-auto transition-all hover:border-primary/50">
            <Filter className="h-5 w-5 text-muted-foreground ml-2" />
            <Select value={filterClassId} onValueChange={setFilterClassId}>
              <SelectTrigger className="w-full sm:w-[220px] border-none shadow-none focus:ring-0 font-bold">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
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
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive border-l-4 animate-scale-in">
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle className="font-black text-lg">Konfigurasi Database Diperlukan</AlertTitle>
          <AlertDescription className="text-base">
            Terjadi kendala saat memuat data. Periksa konsol browser (F12) untuk mengaktifkan Index Firestore.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {[
          { label: "Total Peserta", val: totalParticipants, color: "bg-primary text-primary-foreground", shadow: "shadow-primary/20" },
          { label: "Total Soal", val: totalQuestions, color: "bg-accent text-accent-foreground", shadow: "shadow-accent/20" },
          { label: "Kelas Aktif", val: activeClassesCount, color: "bg-card border-2", shadow: "shadow-black/5", textColor: "text-primary" },
          { label: "Rerata Skor", val: `${avgScore}%`, color: "bg-card border-2", shadow: "shadow-black/5", textColor: "text-[#eab308]" }
        ].map((stat, i) => (
          <Card key={i} className={cn("border-none shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 overflow-hidden", stat.color, stat.shadow)}>
            <CardHeader className="p-6 md:p-8 relative z-10">
              <CardTitle className="text-4xl md:text-6xl font-headline font-black tracking-tighter">{stat.val}</CardTitle>
              <CardDescription className={cn("font-black text-xs md:text-sm uppercase tracking-widest opacity-80", stat.textColor || "text-inherit")}>
                {stat.label}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Card className="lg:col-span-2 shadow-2xl bg-card border-none rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-secondary/10 border-b">
            <CardTitle className="font-headline text-xl flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              Performa Nilai (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[400px] w-full pt-8 px-4">
             {classStats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats}>
                    <XAxis dataKey="name" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} hide={classStats.length > 8} />
                    <YAxis fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="avg" radius={[12, 12, 0, 0]} animationBegin={500} animationDuration={1500}>
                      {classStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic">
                 <Loader2 className="h-8 w-8 animate-spin opacity-20 mb-2" />
                 Belum ada data nilai terkumpul.
               </div>
             )}
          </CardContent>
        </Card>

        <Card className="shadow-2xl bg-card border-none rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-secondary/10 border-b">
            <CardTitle className="font-headline text-xl flex items-center gap-3">
              <div className="bg-accent/20 p-2 rounded-xl">
                <ListChecks className="h-6 w-6 text-accent" />
              </div>
              Sebaran Soal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/5">
                <TableRow>
                  <TableHead className="font-black text-xs uppercase tracking-widest px-6">Nama Kelas</TableHead>
                  <TableHead className="text-right font-black text-xs uppercase tracking-widest px-6">Soal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStats.filter(s => s.isActive).map((s, i) => (
                  <TableRow key={s.id} className="hover:bg-secondary/5 transition-colors group animate-fade-in" style={{ animationDelay: `${0.4 + (i * 0.05)}s` }}>
                    <TableCell className="font-bold text-sm px-6 py-4 truncate group-hover:text-primary transition-colors">{s.name}</TableCell>
                    <TableCell className="text-right px-6">
                      <Badge variant="secondary" className="px-3 py-1 font-black text-sm rounded-lg bg-secondary/50">{s.questionCount}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-2xl bg-card border-none rounded-[2.5rem] overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="bg-primary/5 border-b p-8">
          <CardTitle className="font-headline text-2xl flex items-center gap-4">
            <div className="bg-green-500/20 p-2 rounded-2xl">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            Aktivitas Pengerjaan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y-2 divide-secondary/10">
            {sortedRecentResults.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between p-6 md:p-8 hover:bg-primary/[0.02] transition-all duration-300 group animate-fade-in" style={{ animationDelay: `${0.5 + (i * 0.1)}s` }}>
                <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                  <div className="h-14 w-14 md:h-16 md:w-16 rounded-3xl bg-primary/10 flex items-center justify-center font-black text-primary shrink-0 border-2 border-primary/10 text-xl md:text-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/5">
                    {r?.studentName ? r.studentName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-lg md:text-2xl leading-tight truncate group-hover:text-primary transition-colors">{r?.studentName || "Siswa"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] md:text-xs font-black uppercase tracking-widest border-primary/30 text-primary/70">
                        {safeClasses.find(c => c.id === r.classId)?.name || "Kuis"}
                      </Badge>
                      <span className="text-[10px] md:text-xs text-muted-foreground font-bold">
                        {new Date(r.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <Badge className={cn(
                    "text-xl md:text-3xl font-headline font-black px-6 md:px-8 py-2 md:py-3 rounded-[1.5rem] shadow-xl transition-all group-hover:scale-110",
                    (Number(r?.score) || 0) >= 70 ? "bg-green-500 shadow-green-500/20" : "bg-destructive shadow-destructive/20"
                  )}>
                    {r?.score || 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {sortedRecentResults.length === 0 && (
              <div className="p-20 text-center text-muted-foreground font-medium italic">
                Belum ada aktivitas pengerjaan kuis.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}