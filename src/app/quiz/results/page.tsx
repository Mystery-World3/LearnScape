"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Home, RotateCcw, Award, Lightbulb, Loader2, List, Hash, Type } from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collectionGroup } from "firebase/firestore";
import { QuizResult, Question, Class } from "@/lib/types";
import { cn } from "@/lib/utils";

function ResultsContent() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get("resultId");
  const classId = searchParams.get("classId");
  const router = useRouter();
  
  const firestore = useFirestore();

  const resultRef = useMemoFirebase(() => (resultId && classId) ? doc(firestore, "classes", classId, "quizAttempts", resultId) : null, [firestore, resultId, classId]);
  const { data: result, isLoading: resultLoading } = useDoc<QuizResult>(resultRef);

  const classRef = useMemoFirebase(() => classId ? doc(firestore, "classes", classId) : null, [firestore, classId]);
  const { data: classData } = useDoc<Class>(classRef);

  const questionsQuery = useMemoFirebase(() => collectionGroup(firestore, "questions"), [firestore]);
  const { data: questions } = useCollection<Question>(questionsQuery);
  
  if (resultLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 font-headline font-bold text-xl">Menghitung Skor...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="text-center p-12 max-w-md w-full rounded-[2.5rem] shadow-2xl animate-scale-in">
          <div className="bg-destructive/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <h2 className="text-3xl font-headline font-bold">Hasil tidak ditemukan</h2>
          <Button className="mt-8 h-14 w-full text-lg rounded-2xl" onClick={() => router.push('/')}>Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-12 pb-24">
        <div className="text-center space-y-6 animate-slide-up">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full scale-150 animate-pulse" />
             <div className="relative z-10 bg-white dark:bg-card p-6 rounded-full shadow-2xl border-4 border-primary/20 animate-bounce-subtle">
               <Award className="h-24 w-24 md:h-32 md:w-32 text-accent drop-shadow-lg" />
             </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">Luar Biasa, {result.studentName}!</h1>
            <p className="text-muted-foreground text-xl md:text-2xl font-medium">Kamu telah menyelesaikan LKPD <b>{classData?.name}</b></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-primary text-primary-foreground border-none shadow-2xl rounded-[2.5rem] overflow-hidden group animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] transition-transform group-hover:scale-125 duration-500" />
            <CardHeader className="text-center pb-2 relative">
              <CardDescription className="text-primary-foreground/70 uppercase font-black text-xs md:text-sm tracking-widest pt-4">Skor Kamu</CardDescription>
              <CardTitle className="text-7xl md:text-9xl font-headline font-black py-4 drop-shadow-2xl">{result.score}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-10 relative">
              <Badge variant="secondary" className="bg-white/20 text-white border-none px-6 py-2 text-base md:text-lg font-bold rounded-full backdrop-blur-sm">
                {result.score >= 80 ? "Sangat Memuaskan!" : result.score >= 70 ? "Bagus Sekali!" : "Tetap Semangat!"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-[2.5rem] shadow-xl border-none animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-headline">Ringkasan Pengerjaan</CardTitle>
              <CardDescription className="text-base font-medium">Mari kita lihat bagaimana performa kamu</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-green-500/5 border-2 border-green-500/20 flex items-center justify-between group hover:bg-green-500/10 transition-colors">
                <div>
                  <div className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Jawaban Benar</div>
                  <div className="text-4xl font-headline font-black text-green-600">
                    {result.answers.filter(a => a.isCorrect).length}
                  </div>
                </div>
                <div className="h-16 w-16 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-destructive/5 border-2 border-destructive/20 flex items-center justify-between group hover:bg-destructive/10 transition-colors">
                <div>
                  <div className="text-sm font-bold text-destructive uppercase tracking-wider mb-1">Jawaban Salah</div>
                  <div className="text-4xl font-headline font-black text-destructive">
                    {result.answers.filter(a => !a.isCorrect).length}
                  </div>
                </div>
                <div className="h-16 w-16 bg-destructive/20 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-bold gap-3 border-2 hover:bg-secondary">
                <Home className="h-6 w-6" /> Beranda
              </Button>
              <Button onClick={() => router.push(`/quiz/${result.classId}`)} className="flex-1 h-14 rounded-2xl text-lg font-bold gap-3 shadow-lg shadow-primary/20">
                <RotateCcw className="h-6 w-6" /> Kerjakan Ulang
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-2xl">
              <Lightbulb className="h-8 w-8 text-accent animate-pulse" />
            </div>
            <h2 className="text-3xl font-headline font-black tracking-tight">Kunci Jawaban & Pembahasan</h2>
          </div>
          
          <div className="space-y-6">
            {result.answers.map((answer, idx) => {
              const question = questions?.find(q => q.id === answer.questionId);
              if (!question) return null;

              const studentDisplay = question.type === 'multiple-choice' 
                ? (question.options?.[answer.selectedOptionIndex!] || "Tidak dijawab")
                : (answer.studentAnswer || "Tidak dijawab");

              const correctDisplay = question.type === 'multiple-choice'
                ? (question.options?.[question.correctAnswerIndex!] || "")
                : (question.correctAnswer || "");

              return (
                <Card key={idx} className={cn(
                  "overflow-hidden border-none shadow-lg rounded-[2rem] transition-all hover:shadow-2xl hover:scale-[1.01] duration-300",
                  "border-l-[12px]",
                  answer.isCorrect ? "border-l-green-500" : "border-l-destructive"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="bg-secondary text-secondary-foreground h-10 w-10 rounded-xl flex items-center justify-center font-headline font-black text-xl">
                            {idx + 1}
                          </span>
                          <Badge variant="outline" className="h-7 text-xs font-bold uppercase tracking-widest gap-2 bg-secondary/30">
                             {question.type === 'multiple-choice' ? <List className="h-3 w-3" /> : question.type === 'number' ? <Hash className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                             {question.type?.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xl md:text-2xl font-bold leading-snug">{question.statement}</p>
                      </div>
                      <Badge className={cn(
                        "text-lg px-6 py-2 rounded-2xl font-bold",
                        answer.isCorrect ? "bg-green-500" : "bg-destructive"
                      )}>
                        {answer.isCorrect ? "Benar" : "Salah"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Jawaban Kamu</span>
                        <div className={cn(
                          "p-5 rounded-2xl border-2 font-bold text-lg",
                          answer.isCorrect ? "bg-green-500/5 border-green-500/20 text-green-700" : "bg-destructive/5 border-destructive/20 text-destructive"
                        )}>
                          {studentDisplay}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Kunci Jawaban</span>
                        <div className="p-5 rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary font-black text-lg">
                          {correctDisplay}
                        </div>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="solution" className="border-none bg-secondary/20 rounded-3xl overflow-hidden transition-all hover:bg-secondary/30">
                        <AccordionTrigger className="hover:no-underline px-6 py-4 font-bold text-lg">
                          Lihat Cara Penyelesaian
                        </AccordionTrigger>
                        <AccordionContent className="px-8 pb-6 space-y-4">
                          <div className="space-y-4 pt-4">
                            {question.solutionSteps.map((step, sIdx) => (
                              <div key={sIdx} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${sIdx * 0.1}s` }}>
                                <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black">
                                  {sIdx + 1}
                                </div>
                                <p className="text-base md:text-lg font-medium leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="py-12 flex justify-center animate-fade-in" style={{ animationDelay: '1s' }}>
          <Button 
            onClick={() => router.push('/')} 
            size="lg" 
            className="px-16 h-18 text-2xl font-black rounded-full shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300 bg-primary hover:bg-primary/90"
          >
            Selesai Belajar
          </Button>
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 font-headline font-bold text-xl">Memuat Skor...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
