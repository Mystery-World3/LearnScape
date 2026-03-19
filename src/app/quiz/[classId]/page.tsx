"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Send, CheckCircle2, Loader2, Type, Hash, List } from "lucide-react";
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
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 font-medium text-muted-foreground">Menyiapkan kuis...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center p-4 md:p-6 max-w-3xl mx-auto w-full">
        <div className="w-full mb-6 md:mb-8 space-y-4 animate-fade-in px-2">
          <div className="flex justify-between items-end">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary font-bold uppercase tracking-wider text-[10px] md:text-xs truncate">{classData?.name || "Kuis"}</span>
                <span className="bg-secondary/50 px-2 py-0.5 rounded text-[8px] md:text-[10px] font-bold uppercase flex items-center gap-1 shrink-0">
                  {currentQuestion?.type?.replace('-', ' ')}
                </span>
              </div>
              <h1 className="text-lg md:text-2xl font-headline font-bold">Soal {currentIndex + 1} / {classQuestions?.length}</h1>
            </div>
            <div className="text-right ml-4">
              <span className="text-xl md:text-2xl font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-2 md:h-3" />
        </div>

        {currentQuestion && (
          <Card className="w-full shadow-lg md:shadow-2xl border-none rounded-[1.5rem] md:rounded-[2rem] overflow-hidden animate-fade-in">
            <CardHeader className="pt-6 md:pt-8 px-6 md:px-8">
              <CardTitle className="text-lg md:text-2xl leading-relaxed font-headline">
                {currentQuestion.statement}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-6 md:pb-8">
              {currentQuestion.type === 'multiple-choice' ? (
                <RadioGroup 
                  value={answers[currentIndex]?.toString()} 
                  onValueChange={(val) => handleSelectOption(parseInt(val))}
                  className="space-y-3 md:space-y-4"
                >
                  {currentQuestion.options?.map((option, idx) => (
                    <Label
                      key={idx}
                      htmlFor={`option-${idx}`}
                      className={cn(
                        "flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all hover:bg-secondary/50",
                        answers[currentIndex] === idx ? "border-primary bg-primary/5 shadow-md" : "border-muted"
                      )}
                    >
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="sr-only" />
                      <div className={cn(
                        "h-8 w-8 md:h-10 md:w-10 shrink-0 flex items-center justify-center rounded-full border-2 text-sm md:text-base font-bold transition-colors",
                        answers[currentIndex] === idx ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm md:text-lg font-medium">{option}</span>
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-4 pt-2 md:pt-4">
                  <Label className="text-xs md:text-sm text-muted-foreground font-bold">Ketik Jawaban Kamu:</Label>
                  <Input 
                    type={currentQuestion.type === 'number' ? 'number' : 'text'}
                    value={answers[currentIndex] || ""}
                    onChange={(e) => handleTextInput(e.target.value)}
                    placeholder={currentQuestion.type === 'number' ? '0...' : 'Ketik di sini...'}
                    className="h-12 md:h-16 text-xl md:text-2xl font-bold text-center border-2 border-primary/20 focus-visible:ring-primary rounded-xl md:rounded-2xl"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-6 md:p-8 border-t bg-secondary/10 gap-2">
              <Button 
                variant="ghost" 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="gap-1 h-10 md:h-12 px-3 md:px-6 rounded-xl font-bold text-xs md:text-base"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" /> Kembali
              </Button>
              
              {currentIndex === (classQuestions?.length || 0) - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  className="gap-1 md:gap-2 bg-[#facc15] hover:bg-[#eab308] text-black h-10 md:h-12 px-4 md:px-8 rounded-xl font-bold text-xs md:text-base"
                  disabled={!isCurrentAnswered || Object.keys(answers).length < (classQuestions?.length || 0)}
                >
                  Kirim <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  className="gap-1 md:gap-2 bg-[#3b49df] hover:bg-[#2f3ab2] text-white h-10 md:h-12 px-4 md:px-8 rounded-xl font-bold text-xs md:text-base" 
                  disabled={!isCurrentAnswered}
                >
                  Lanjut <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
        
        <div className="mt-6 md:mt-8 flex gap-2 overflow-x-auto pb-6 w-full justify-start md:justify-center scrollbar-hide px-2">
          {classQuestions?.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-lg md:rounded-xl font-bold border-2 transition-all flex items-center justify-center text-xs md:text-base",
                currentIndex === idx ? "border-primary bg-primary text-primary-foreground scale-110 shadow-lg" : 
                answers[idx] !== undefined && answers[idx] !== "" ? "border-[#facc15] bg-[#facc15]/10 text-[#eab308]" : "border-muted bg-white text-muted-foreground"
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
