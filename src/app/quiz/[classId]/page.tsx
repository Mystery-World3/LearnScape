"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, Send, CheckCircle2, Loader2 } from "lucide-react";
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
  const [answers, setAnswers] = useState<number[]>([]);

  // Inisialisasi answers saat data pertanyaan dimuat
  useEffect(() => {
    if (classQuestions && answers.length === 0) {
      setAnswers(new Array(classQuestions.length).fill(-1));
    }
  }, [classQuestions, answers.length]);

  const progress = classQuestions && classQuestions.length > 0 ? ((currentIndex + 1) / classQuestions.length) * 100 : 0;
  const currentQuestion = classQuestions ? classQuestions[currentIndex] : null;

  const handleSelectOption = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (classQuestions && currentIndex < classQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!classQuestions || !classId) return;

    const finalAnswers = classQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedOptionIndex: answers[idx],
      isCorrect: answers[idx] === q.correctAnswerIndex
    }));

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

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 font-medium text-muted-foreground">Menyiapkan kuis...</p>
      </div>
    );
  }

  if (!classQuestions || classQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Maaf, kelas ini belum memiliki pertanyaan.</h2>
        <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        <div className="w-full mb-8 space-y-4 animate-fade-in">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-primary font-bold uppercase tracking-wider text-sm">{classData?.name || "Kuis"}</h2>
              <h1 className="text-2xl font-headline font-bold">Pertanyaan {currentIndex + 1} dari {classQuestions.length}</h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              <p className="text-xs text-muted-foreground font-medium">Progress Pengerjaan</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {currentQuestion && (
          <Card className="w-full shadow-2xl border-none rounded-[2rem] overflow-hidden animate-fade-in">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-xl md:text-2xl leading-relaxed text-balance font-headline">
                {currentQuestion.statement}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <RadioGroup 
                value={answers[currentIndex]?.toString()} 
                onValueChange={(val) => handleSelectOption(parseInt(val))}
                className="space-y-4"
              >
                {currentQuestion.options.map((option, idx) => (
                  <Label
                    key={idx}
                    htmlFor={`option-${idx}`}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:bg-secondary/50",
                      answers[currentIndex] === idx ? "border-primary bg-primary/5" : "border-muted"
                    )}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="sr-only" />
                    <div className={cn(
                      "h-10 w-10 shrink-0 flex items-center justify-center rounded-full border-2 text-base font-bold transition-colors",
                      answers[currentIndex] === idx ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium">{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between p-8 border-t bg-secondary/10">
              <Button 
                variant="ghost" 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="gap-2 h-12 px-6 rounded-xl font-bold"
              >
                <ChevronLeft className="h-5 w-5" /> Sebelumnya
              </Button>
              
              {currentIndex === classQuestions.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  className="gap-2 bg-[#facc15] hover:bg-[#eab308] text-black h-12 px-8 rounded-xl font-bold shadow-lg shadow-yellow-500/20"
                  disabled={answers.some(a => a === -1)}
                >
                  Selesaikan Kuis <CheckCircle2 className="h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  className="gap-2 bg-[#3b49df] hover:bg-[#2f3ab2] text-white h-12 px-8 rounded-xl font-bold" 
                  disabled={answers[currentIndex] === -1}
                >
                  Selanjutnya <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
        
        <div className="mt-8 flex gap-3 overflow-x-auto pb-6 w-full justify-center scrollbar-hide">
          {classQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-12 w-12 shrink-0 rounded-xl font-bold border-2 transition-all flex items-center justify-center",
                currentIndex === idx ? "border-primary bg-primary text-primary-foreground scale-110 shadow-xl" : 
                answers[idx] !== -1 ? "border-[#facc15] bg-[#facc15]/10 text-[#eab308]" : "border-muted bg-white text-muted-foreground"
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