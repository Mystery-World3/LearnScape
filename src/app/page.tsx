
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, ArrowRight } from "lucide-react";
import { MOCK_CLASSES } from "@/lib/mock-data";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function LandingPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [studentName] = useLocalStorage<string>("student_name", "Siswa");
  const [classes] = useLocalStorage("classes", MOCK_CLASSES);

  const handleStartQuiz = () => {
    if (!selectedClass) return;
    router.push(`/quiz/${selectedClass}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f9] dark:bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl w-full space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-[#3b49df] dark:text-primary">
              Belajar Jadi Lebih <br />
              <span className="text-[#facc15]">Menyenangkan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Akses Lembar Kerja Peserta Didik (LKPD) digital interaktif untuk menunjang proses pembelajaranmu di mana saja dan kapan saja.
            </p>
          </div>

          <Card className="max-w-md mx-auto shadow-2xl border-none rounded-[2rem] overflow-hidden p-2">
            <CardContent className="pt-8 pb-8 space-y-8">
              <div className="flex items-center justify-center gap-2 text-[#3b49df] font-bold text-lg">
                <GraduationCap className="h-6 w-6" />
                <span>Pilih Kelas Kamu</span>
              </div>

              <div className="space-y-4">
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                  <SelectTrigger className="h-14 bg-[#eef0f7] dark:bg-secondary border-none rounded-xl text-base px-6">
                    <SelectValue placeholder="Pilih jenjang kelas..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  className="w-full h-14 text-lg font-bold gap-2 rounded-xl bg-[#98a3e0] hover:bg-[#3b49df] text-white transition-all group"
                  disabled={!selectedClass}
                  onClick={handleStartQuiz}
                >
                  Mulai Belajar
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-auto py-10 text-muted-foreground text-sm font-medium">
          © 2024 LearnScape - LKPD DIGITAL INTERAKTIF.
        </div>
      </main>
    </div>
  );
}
