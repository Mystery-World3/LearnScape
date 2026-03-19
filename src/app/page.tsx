"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowRight, User, Loader2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Class } from "@/lib/types";

export default function LandingPage() {
  const router = useRouter();
  const firestore = useFirestore();
  
  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes, isLoading } = useCollection<Class>(classesQuery);

  const activeClasses = classes?.filter(c => c.isActive) || [];

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [studentName, setStudentName] = useLocalStorage<string>("student_name", "");
  const [tempName, setTempName] = useState("");
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);

  const handleStartQuiz = () => {
    if (!selectedClass) return;
    
    if (!studentName) {
      setTempName("");
      setIsNameDialogOpen(true);
    } else {
      router.push(`/quiz/${selectedClass}`);
    }
  };

  const handleSaveNameAndStart = () => {
    if (!tempName.trim()) return;
    setStudentName(tempName.trim());
    setIsNameDialogOpen(false);
    router.push(`/quiz/${selectedClass}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center">
        <div className="max-w-3xl w-full space-y-6 md:space-y-10">
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-8xl font-headline font-bold leading-none text-primary tracking-tight">
              Belajar Jadi Lebih <br />
              <span className="text-accent inline-block hover:scale-105 transition-transform duration-300 cursor-default">Menyenangkan</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Akses Lembar Kerja Peserta Didik (LKPD) digital interaktif untuk menunjang proses pembelajaranmu di sekolah.
            </p>
          </div>

          <div className="animate-scale-in opacity-0" style={{ animationDelay: '0.6s' }}>
            <Card className="max-w-md mx-auto shadow-2xl border-none rounded-[2rem] overflow-hidden p-2 bg-card/80 backdrop-blur-sm hover:shadow-primary/10 transition-shadow duration-500">
              <CardContent className="pt-8 pb-8 space-y-8">
                <div className="flex items-center justify-center gap-3 text-primary font-bold text-lg md:text-xl">
                  <GraduationCap className="h-6 w-6 md:h-7 md:w-7 animate-bounce" />
                  <span>Pilih Kelas Kamu</span>
                </div>

                <div className="space-y-4 px-2 md:px-0 text-left">
                  <Select onValueChange={setSelectedClass} value={selectedClass} disabled={isLoading}>
                    <SelectTrigger className="h-14 md:h-16 bg-secondary border-none rounded-2xl text-base md:text-lg px-6 shadow-inner focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder={isLoading ? "Memuat kelas..." : "Pilih jenjang kelas..."} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {activeClasses.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="h-12 focus:bg-accent focus:text-accent-foreground cursor-pointer">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {activeClasses.length > 0 && (
                    <Button 
                      className="w-full h-14 md:h-16 text-lg md:text-xl font-bold gap-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-primary/30 transition-all duration-300 group hover:scale-[1.02] active:scale-95 mt-2"
                      disabled={!selectedClass || isLoading}
                      onClick={handleStartQuiz}
                    >
                      {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Mulai Belajar"}
                      {!isLoading && <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />}
                    </Button>
                  )}
                  
                  {studentName && activeClasses.length > 0 && (
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => { setTempName(studentName); setIsNameDialogOpen(true); }}
                        className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30"
                      >
                        Bukan {studentName}? Klik untuk ganti nama
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md rounded-3xl animate-scale-in">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-headline">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                Siapa namamu?
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Masukkan nama lengkapmu agar Bapak/Ibu Guru bisa mencatat nilaimu ke dalam daftar hadir.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-bold">Nama Lengkap Siswa</Label>
                <Input 
                  id="name" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)} 
                  placeholder="Contoh: Budi Santoso"
                  className="h-14 text-lg rounded-2xl border-2 focus-visible:ring-primary/20"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNameAndStart()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSaveNameAndStart} 
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                disabled={!tempName.trim()}
              >
                Simpan & Lanjut Kuis
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-auto py-10 text-muted-foreground text-xs md:text-sm font-medium opacity-60 animate-fade-in" style={{ animationDelay: '1s' }}>
          © 2024 LearnScape - Platform LKPD Digital Interaktif
        </div>
      </main>
    </div>
  );
}
