"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Send, CheckCircle2, Loader2, List, Hash, Type } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Question, QuizResult, Class } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const { classId } = useParams();
  const router = useRouter();
  const firestore = useFirestore();

  const classRef = useMemoFirebase(() => classId ? doc(firestore, "classes", classId as string) : null, [firestore, classId]);
  const { data: classData } = useDoc<Class>(classRef);

  const questionsQuery = useMemoFirebase(() => classId ? collection(firestore, "classes", classId as string, "questions") : null, [firestore, classId]);
  const { data: classQuestions, isLoading: questionsLoading } = useCollection<Question>(questionsQuery);

  const [studentName] = useLocalStorage<string>("student_name", "");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);

  const progress = classQuestions && classQuestions.length > 0 ? ((currentIndex + 1) / classQuestions.length) * 100 : 0;
  const currentQuestion = classQuestions ? classQuestions[currentIndex] : null;

  const handleSelectOption = (index: number) => {
    setAnswers({ ...answers, [currentIndex]: index });
  };

  const handleTextInput = (val: string) => {
    setAnswers({ ...answers, [currentIndex]: val });
  };

  const handleNext = () => {
    if (classQuestions && currentIndex < classQuestions.length - 1) {
      setDirection('next');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setDirection(null);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('prev');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setDirection(null);
      }, 150);
    }
  };

  const handleSubmit = async () => {
    if (!classQuestions || !classId) return;

    const finalAnswers = classQuestions.map((q, idx) => {
      const studentAns = answers[idx];
      let isCorrect = false;

      if (q.type === 'multiple-choice') {
        isCorrect = studentAns === q.correctAnswerIndex;
      } else {
        isCorrect = studentAns?.toString().toLowerCase().trim() === q.correctAnswer?.toString().toLowerCase().trim();
      }

      return {
        questionId: q.id,
        selectedOptionIndex: q.type === 'multiple-choice' ? studentAns : undefined,
        studentAnswer: q.type !== 'multiple-choice' ? studentAns?.toString() : undefined,
        isCorrect
      };
    });

    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / classQuestions.length) * 100);

    const attemptsColRef = collection(firestore, "classes", classId as string, "quizAttempts");
    
    const newResult = {
      studentName,
      classId: classId as string,
      score,
      totalQuestions: classQuestions.length,
      timestamp: new Date().toISOString(),
      answers: finalAnswers
    };

    const docRef = await addDocumentNonBlocking(attemptsColRef, newResult);
    if (docRef) {
      router.push(`/quiz/results?resultId=${docRef.id}&classId=${classId}`);
    }
  };

  const isCurrentAnswered = answers[currentIndex] !== undefined && answers[currentIndex] !== "";

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        </div>
        <p className="mt-6 font-headline font-bold text-xl animate-pulse">Menyiapkan Lembar Kerja...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="w-full mb-8 space-y-6 animate-fade-in px-2">
          <div className="flex justify-between items-end">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] md:text-xs border border-primary/20">
                  {classData?.name || "Kuis"}
                </span>
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase flex items-center gap-1.5 border border-accent/20">
                  {currentQuestion?.type === 'multiple-choice' ? <List className="h-3 w-3" /> : currentQuestion?.type === 'number' ? <Hash className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                  {currentQuestion?.type?.replace('-', ' ')}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-headline font-bold">Soal {currentIndex + 1} <span className="text-muted-foreground font-normal text-lg md:text-2xl">/ {classQuestions?.length}</span></h1>
            </div>
            <div className="text-right ml-4 shrink-0">
              <div className="text-3xl md:text-5xl font-headline font-bold text-primary tabular-nums">{Math.round(progress)}<span className="text-lg md:text-2xl opacity-50">%</span></div>
            </div>
          </div>
          <div className="relative h-3 md:h-4 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out shadow-lg shadow-primary/40 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentQuestion && (
          <div className={cn(
            "w-full transition-all duration-300 transform",
            direction === 'next' ? "-translate-x-full opacity-0" : direction === 'prev' ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
          )}>
            <Card className="w-full shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white dark:bg-card">
              <CardHeader className="pt-10 md:pt-14 px-8 md:px-12">
                <CardTitle className="text-2xl md:text-4xl leading-snug md:leading-tight font-headline tracking-tight">
                  {currentQuestion.statement}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 md:px-12 pb-10 md:pb-14">
                {currentQuestion.type === 'multiple-choice' ? (
                  <div className="grid grid-cols-1 gap-4 md:gap-6 mt-6">
                    {currentQuestion.options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={cn(
                          "flex items-center gap-5 p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border-4 text-left transition-all duration-300 hover:scale-[1.01] active:scale-95",
                          answers[currentIndex] === idx 
                            ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                            : "border-secondary bg-secondary/30 hover:bg-secondary/50"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 md:h-14 md:w-14 shrink-0 flex items-center justify-center rounded-2xl border-2 text-lg md:text-2xl font-bold transition-all",
                          answers[currentIndex] === idx ? "bg-primary border-primary text-primary-foreground rotate-6" : "bg-white dark:bg-background border-muted text-muted-foreground"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={cn("text-lg md:text-2xl font-bold leading-tight", answers[currentIndex] === idx ? "text-primary" : "text-foreground")}>
                          {option}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 pt-6 md:pt-10">
                    <Label className="text-lg md:text-xl text-muted-foreground font-bold flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Jawaban Kamu:
                    </Label>
                    <Input 
                      type={currentQuestion.type === 'number' ? 'number' : 'text'}
                      value={answers[currentIndex] || ""}
                      onChange={(e) => handleTextInput(e.target.value)}
                      placeholder={currentQuestion.type === 'number' ? 'Ketik angka...' : 'Ketik jawaban di sini...'}
                      className="h-20 md:h-28 text-3xl md:text-5xl font-headline font-bold text-center border-4 border-dashed border-primary/30 focus-visible:border-primary focus-visible:ring-primary/10 rounded-[2rem] md:rounded-[2.5rem] bg-secondary/20 placeholder:text-muted-foreground/30"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between p-8 md:p-12 border-t-4 border-secondary/20 bg-secondary/5 gap-4">
                <Button 
                  variant="ghost" 
                  onClick={handlePrev} 
                  disabled={currentIndex === 0}
                  className="gap-2 h-14 md:h-20 px-6 md:px-10 rounded-2xl font-bold text-lg md:text-xl hover:bg-secondary"
                >
                  <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" /> Kembali
                </Button>
                
                {currentIndex === (classQuestions?.length || 0) - 1 ? (
                  <Button 
                    onClick={handleSubmit} 
                    className="gap-3 bg-primary hover:bg-primary/90 text-primary-foreground h-14 md:h-20 px-8 md:px-12 rounded-2xl font-bold text-lg md:text-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    disabled={!isCurrentAnswered || Object.keys(answers).length < (classQuestions?.length || 0)}
                  >
                    Kirim Jawaban <Send className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext} 
                    className="gap-3 bg-accent hover:bg-accent/90 text-accent-foreground h-14 md:h-20 px-8 md:px-12 rounded-2xl font-bold text-lg md:text-2xl shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all" 
                    disabled={!isCurrentAnswered}
                  >
                    Lanjut <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
        
        <div className="mt-10 flex gap-3 overflow-x-auto pb-10 w-full justify-start md:justify-center scrollbar-hide px-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {classQuestions?.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-2xl font-headline font-bold border-4 transition-all duration-300 flex items-center justify-center text-xl md:text-2xl hover:scale-110",
                currentIndex === idx 
                  ? "border-primary bg-primary text-primary-foreground scale-110 shadow-xl shadow-primary/20 z-10" 
                  : answers[idx] !== undefined && answers[idx] !== "" 
                    ? "border-accent bg-accent/10 text-accent" 
                    : "border-secondary bg-white dark:bg-card text-muted-foreground opacity-50"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
