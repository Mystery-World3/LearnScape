"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Home, RotateCcw, Award, Lightbulb } from "lucide-react";
import { MOCK_QUESTIONS, MOCK_CLASSES } from "@/lib/mock-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { QuizResult, Question } from "@/lib/types";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get("resultId");
  const router = useRouter();
  const [results] = useLocalStorage<QuizResult[]>("quiz_results", []);
  const [questions] = useLocalStorage<Question[]>("questions", MOCK_QUESTIONS);
  const [classes] = useLocalStorage("classes", MOCK_CLASSES);

  const result = useMemo(() => results.find(r => r.id === resultId), [results, resultId]);
  
  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Hasil tidak ditemukan</h2>
          <Button className="mt-6" onClick={() => router.push('/')}>Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  const resultClass = classes.find(c => c.id === result.classId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
             <Award className="h-24 w-24 text-primary relative z-10 mx-auto" />
          </div>
          <h1 className="text-4xl font-headline font-bold">Luar Biasa, {result.studentName}!</h1>
          <p className="text-muted-foreground text-lg">Kamu telah menyelesaikan kuis <b>{resultClass?.name}</b></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardDescription className="text-primary-foreground/70 uppercase font-bold text-xs">Skor Akhir</CardDescription>
              <CardTitle className="text-6xl font-headline">{result.score}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                {result.score >= 70 ? "Sangat Baik!" : "Terus Berlatih!"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Ringkasan Jawaban</CardTitle>
              <CardDescription>Detail performa kuis kamu</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 border">
                <div className="text-sm text-muted-foreground">Benar</div>
                <div className="text-2xl font-bold text-primary flex items-center gap-2">
                  {result.answers.filter(a => a.isCorrect).length} <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border">
                <div className="text-sm text-muted-foreground">Salah</div>
                <div className="text-2xl font-bold text-destructive flex items-center gap-2">
                  {result.answers.filter(a => !a.isCorrect).length} <XCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1 gap-2">
                <Home className="h-4 w-4" /> Beranda
              </Button>
              <Button onClick={() => router.push(`/quiz/${result.classId}`)} className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" /> Ulangi
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-headline font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            Pembahasan Soal
          </h2>
          <div className="space-y-4">
            {result.answers.map((answer, idx) => {
              const question = questions.find(q => q.id === answer.questionId);
              if (!question) return null;

              return (
                <Card key={idx} className={cn("overflow-hidden border-l-8", answer.isCorrect ? "border-l-primary" : "border-l-destructive")}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Soal {idx + 1}</CardTitle>
                      <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                        {answer.isCorrect ? "Benar" : "Salah"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2">{question.statement}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Jawaban Kamu</span>
                        <div className={cn("p-3 rounded-lg border", !answer.isCorrect && "bg-destructive/10 border-destructive text-destructive font-bold")}>
                          {question.options[answer.selectedOptionIndex] || "Tidak dijawab"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Jawaban Benar</span>
                        <div className="p-3 rounded-lg border-primary bg-primary/10 text-primary font-bold">
                          {question.options[question.correctAnswerIndex]}
                        </div>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="solution" className="border-none">
                        <AccordionTrigger className="hover:no-underline bg-secondary/50 px-4 rounded-lg">
                          Lihat Cara Penyelesaian
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 px-4 space-y-2">
                          {question.solutionSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex gap-3">
                              <span className="h-6 w-6 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                {sIdx + 1}
                              </span>
                              <p className="text-sm">{step}</p>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="py-8 flex justify-center">
          <Button onClick={() => router.push('/')} size="lg" className="px-12 rounded-full h-14 text-xl font-bold shadow-xl hover:scale-105 transition-transform">
            Selesai
          </Button>
        </div>
      </main>
    </div>
  );
}
