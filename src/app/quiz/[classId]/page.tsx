
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from "lucide-react";
import { MOCK_QUESTIONS, MOCK_CLASSES } from "@/lib/mock-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Question, QuizResult } from "@/lib/types";

export default function QuizPage() {
  const { classId } = useParams();
  const router = useRouter();
  const [questions] = useLocalStorage<Question[]>("questions", MOCK_QUESTIONS);
  const [classes] = useLocalStorage("classes", MOCK_CLASSES);
  const [results, setResults] = useLocalStorage<QuizResult[]>("quiz_results", []);
  const [studentName] = useLocalStorage<string>("student_name", "");

  const classQuestions = useMemo(() => 
    questions.filter(q => q.classId === classId),
    [questions, classId]
  );

  const className = useMemo(() => 
    classes.find(c => c.id === classId)?.name || "Kuis Matematika",
    [classes, classId]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(classQuestions.length).fill(-1));

  const progress = ((currentIndex + 1) / classQuestions.length) * 100;
  const currentQuestion = classQuestions[currentIndex];

  const handleSelectOption = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < classQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    const finalAnswers = classQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedOptionIndex: answers[idx],
      isCorrect: answers[idx] === q.correctAnswerIndex
    }));

    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / classQuestions.length) * 100);

    const newResult: QuizResult = {
      id: Math.random().toString(36).substr(2, 9),
      studentName,
      classId: classId as string,
      score,
      totalQuestions: classQuestions.length,
      timestamp: new Date().toISOString(),
      answers: finalAnswers
    };

    setResults([...results, newResult]);
    router.push(`/quiz/results?resultId=${newResult.id}`);
  };

  if (classQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Maaf, kelas ini belum memiliki pertanyaan.</h2>
        <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        <div className="w-full mb-8 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-primary font-bold uppercase tracking-wider text-sm">{className}</h2>
              <h1 className="text-2xl font-headline font-bold">Pertanyaan {currentIndex + 1} dari {classQuestions.length}</h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              <p className="text-xs text-muted-foreground font-medium">Progress Pengerjaan</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="w-full shadow-lg border-primary/5">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed text-balance">
              {currentQuestion.statement}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={answers[currentIndex].toString()} 
              onValueChange={(val) => handleSelectOption(parseInt(val))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <Label
                  key={idx}
                  htmlFor={`option-${idx}`}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-secondary/50",
                    answers[currentIndex] === idx ? "border-primary bg-primary/5" : "border-muted"
                  )}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="sr-only" />
                  <div className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-full border-2 text-sm font-bold",
                    answers[currentIndex] === idx ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-base font-medium">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Button>
            
            {currentIndex === classQuestions.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={answers.some(a => a === -1)}
              >
                Selesaikan Kuis <CheckCircle2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2" disabled={answers[currentIndex] === -1}>
                Selanjutnya <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-8 flex gap-2 overflow-x-auto pb-4 w-full justify-center">
          {classQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-10 w-10 shrink-0 rounded-lg font-bold border-2 transition-all",
                currentIndex === idx ? "border-primary bg-primary text-primary-foreground scale-110 shadow-md" : 
                answers[idx] !== -1 ? "border-accent bg-accent/10 text-accent" : "border-muted text-muted-foreground"
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
