
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowRight, BookOpen, BrainCircuit } from "lucide-react";
import { MOCK_CLASSES } from "@/lib/mock-data";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function LandingPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [studentName, setStudentName] = useLocalStorage<string>("student_name", "");
  const [classes] = useLocalStorage("classes", MOCK_CLASSES);

  const handleStartQuiz = () => {
    if (!selectedClass || !studentName) return;
    router.push(`/quiz/${selectedClass}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm border border-accent/20">
              <BrainCircuit className="h-4 w-4" />
              Smarter Learning, Better Scores
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
              Kuasai Matematika <br />
              <span className="text-primary">Kapan Saja, Di Mana Saja</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              LearnScape membantu siswa memahami konsep matematika melalui kuis interaktif dan langkah penyelesaian yang mendalam.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-card p-4 rounded-xl border shadow-sm">
                <div className="bg-primary/10 p-2 rounded-lg"><BookOpen className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="font-bold">100+</div>
                  <div className="text-xs text-muted-foreground">Soal Latihan</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card p-4 rounded-xl border shadow-sm">
                <div className="bg-accent/10 p-2 rounded-lg"><GraduationCap className="h-5 w-5 text-accent" /></div>
                <div>
                  <div className="font-bold">Akses</div>
                  <div className="text-xs text-muted-foreground">Kelas Beragam</div>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-2xl border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Ayo Mulai Belajar!</CardTitle>
              <CardDescription>Pilih kelasmu dan masukkan namamu untuk memulai kuis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="class">Pilih Kelas</Label>
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                  <SelectTrigger id="class" className="h-12 border-muted-foreground/20">
                    <SelectValue placeholder="Pilih kelas yang tersedia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan namamu..."
                  className="h-12 border-muted-foreground/20"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg font-bold gap-2 group transition-all"
                disabled={!selectedClass || !studentName}
                onClick={handleStartQuiz}
              >
                Mulai Kuis Sekarang
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-20 text-center text-muted-foreground text-sm opacity-50">
          © 2024 LearnScape. Platform Edukasi Terpercaya.
        </div>
      </main>
    </div>
  );
}
