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
import { GraduationCap, ArrowRight, User, Loader2, Info } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Class } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
                <Select onValueChange={setSelectedClass} value={selectedClass} disabled={isLoading}>
                  <SelectTrigger className="h-14 bg-[#eef0f7] dark:bg-secondary border-none rounded-xl text-base px-6">
                    <SelectValue placeholder={isLoading ? "Memuat kelas..." : "Pilih jenjang kelas..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    {activeClasses.length === 0 && !isLoading && (
                      <div className="p-4 text-sm text-muted-foreground text-center italic">
                        Belum ada kelas aktif yang tersedia saat ini.
                      </div>
                    )}
                  </SelectContent>
                </Select>

                {activeClasses.length > 0 && (
                  <Button 
                    className="w-full h-14 text-lg font-bold gap-2 rounded-xl bg-[#98a3e0] hover:bg-[#3b49df] text-white transition-all group"
                    disabled={!selectedClass || isLoading}
                    onClick={handleStartQuiz}
                  >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Mulai Belajar"}
                    {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                )}
                
                {studentName && activeClasses.length > 0 && (
                  <button 
                    onClick={() => { setTempName(studentName); setIsNameDialogOpen(true); }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                  >
                    Bukan {studentName}? Ubah Nama
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {activeClasses.length === 0 && !isLoading && (
            <Alert className="max-w-md mx-auto border-dashed">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Hubungi Bapak/Ibu Guru untuk mengaktifkan kuis kelasmu.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Siapa namamu?
              </DialogTitle>
              <DialogDescription>
                Masukkan nama lengkapmu agar Bapak/Ibu Guru bisa mencatat nilaimu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)} 
                  placeholder="Contoh: Budi Santoso"
                  className="h-12"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNameAndStart()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSaveNameAndStart} 
                className="w-full h-12 font-bold"
                disabled={!tempName.trim()}
              >
                Simpan & Lanjut Kuis
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-auto py-10 text-muted-foreground text-sm font-medium">
          © 2024 LearnScape - LKPD DIGITAL INTERAKTIF.
        </div>
      </main>
    </div>
  );
}
