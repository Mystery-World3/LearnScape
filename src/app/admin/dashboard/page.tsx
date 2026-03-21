"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Loader2, AlertTriangle, CheckCircle2, Filter, ListChecks, Users, BookMarked } from "lucide-react";
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

  const validQuestions = useMemo(() => {
    const classIds = new Set(safeClasses.map(c => c.id));
    return safeQuestions.filter(q => q.classId && classIds.has(q.classId));
  }, [safeQuestions, safeClasses]);

  const filteredResults = useMemo(() => {
    if (filterClassId === "all") return safeResults;
    return safeResults.filter(r => r.classId === filterClassId);
  }, [safeResults, filterClassId]);

  const totalParticipants = filteredResults.length;
  const totalQuestions = validQuestions.length;
  const activeClassesCount = safeClasses.filter(c => c.isActive).length;

  const avgScore = useMemo(() => {
    if (totalParticipants === 0) return 0;
    const total = filteredResults.reduce((acc, curr) => acc + (Number(curr?.score) || 0), 0);
    return Math.round(total / totalParticipants);
  }, [filteredResults, totalParticipants]);
  
  const classStats = useMemo(() => {
    if (!safeClasses.length) return [];
    return safeClasses.map(c => {
      const classResults = safeResults.filter(r => r?.classId === c?.id);
      const classQuestionsCount = validQuestions.filter(q => q.classId === c.id).length;
      const totalScore = classResults.reduce((acc, curr) => acc + (Number(curr?.score) || 0), 0);
      return {
        id: c.id,
        name: c?.name || "Materi",
        isActive: c.isActive,
        count: classResults.length,
        questionCount: classQuestionsCount,
        avg: classResults.length ? Math.round(totalScore / classResults.length) : 0
      };
    }).sort((a, b) => b.avg - a.avg);
  }, [safeClasses, safeResults, validQuestions]);

  const sortedRecentResults = useMemo(() => {
    if (!filteredResults.length) return [];
    return [...filteredResults]
      .filter(r => r && r.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [filteredResults]);

  const COLORS = ['#3b82f6', '#2563eb', '#10b981', '#6366f1', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="font-headline font-bold text-lg">Menyiapkan Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-headline font-black tracking-tight">Ringkasan Statistik</h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">Monitor performa siswa dan aktivitas kuis secara real-time.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border-2 shadow-sm w-full md:w-auto transition-all hover:border-primary/50">
          <Filter className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="w-full md:w-[220px] border-none shadow-none focus:ring-0 font-bold h-9">
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

      {hasError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive border-l-4 animate-scale-in">
          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
          <AlertTitle className="font-black text-base md:text-lg">Konfigurasi Database Diperlukan</AlertTitle>
          <AlertDescription className="text-sm">
            Terjadi kendala saat memuat data. Periksa konsol browser (F12) untuk melihat pesan error detail dari Firebase.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: "Peserta", val: totalParticipants, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Soal", val: totalQuestions, icon: ListChecks, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Aktif", val: activeClassesCount, icon: BookMarked, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Rerata", val: `${avgScore}%`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md md:shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 md:gap-4">
              <div className={cn("h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("h-5 w-5 md:h-7 md:w-7", stat.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-xl md:text-3xl font-headline font-black">{stat.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 shadow-lg md:shadow-xl border-none rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-secondary/10 border-b p-4 md:p-6">
            <CardTitle className="font-headline text-lg md:text-xl flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performa Rerata Nilai
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[400px] w-full pt-6 md:pt-8 px-2 md:px-4">
             {classStats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats}>
                    <XAxis 
                      dataKey="name" 
                      fontSize={10} 
                      fontWeight="bold" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{fill: 'currentColor'}}
                      hide={classStats.length > 5}
                    />
                    <YAxis 
                      fontSize={10} 
                      fontWeight="bold" 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[0, 100]}
                      tick={{fill: 'currentColor'}}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]} animationBegin={500}>
                      {classStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic text-sm">
                 Belum ada data nilai.
               </div>
             )}
          </CardContent>
        </Card>

        <Card className="shadow-lg md:shadow-xl border-none rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-secondary/10 border-b p-4 md:p-6">
            <CardTitle className="font-headline text-lg md:text-xl flex items-center gap-3">
              <ListChecks className="h-5 w-5 text-accent" />
              Statistik Soal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase px-4 md:px-6">Materi</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase px-4 md:px-6">Soal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStats.filter(s => s.isActive).map((s, i) => (
                  <TableRow key={s.id} className="hover:bg-secondary/5">
                    <TableCell className="font-bold text-xs md:text-sm px-4 md:px-6 py-3 md:py-4 truncate max-w-[150px]">{s.name}</TableCell>
                    <TableCell className="text-right px-4 md:px-6">
                      <Badge variant="secondary" className="font-black text-[10px]">{s.questionCount}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {classStats.filter(s => s.isActive).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10 text-muted-foreground italic text-sm">
                      Tidak ada kelas aktif.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg md:shadow-xl border-none rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
          <CardTitle className="font-headline text-xl md:text-2xl flex items-center gap-4">
            <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y border-t">
            {sortedRecentResults.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between p-4 md:p-8 hover:bg-primary/[0.01] transition-colors group">
                <div className="flex items-center gap-3 md:gap-6 min-w-0">
                  <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border-2 border-primary/10 text-base md:text-xl shrink-0">
                    {r?.studentName ? r.studentName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm md:text-xl truncate leading-tight group-hover:text-primary transition-colors">{r?.studentName || "Siswa"}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 md:mt-1">
                      <Badge variant="outline" className="text-[8px] md:text-[10px] uppercase tracking-widest border-primary/20 truncate max-w-[100px] md:max-w-none">
                        {safeClasses.find(c => c.id === r.classId)?.name || "Kuis"}
                      </Badge>
                      <span className="text-[8px] md:text-[10px] text-muted-foreground font-bold whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className={cn(
                    "text-lg md:text-3xl font-headline font-black px-3 py-1 md:px-6 md:py-2 rounded-lg md:rounded-2xl shadow-sm md:shadow-lg transition-all",
                    (Number(r?.score) || 0) >= 70 ? "bg-green-500 text-white" : "bg-destructive text-white"
                  )}>
                    {r?.score || 0}%
                  </div>
                </div>
              </div>
            ))}
            {sortedRecentResults.length === 0 && (
              <div className="p-10 md:p-20 text-center text-muted-foreground text-sm font-medium italic">
                Belum ada pengerjaan kuis terbaru.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
