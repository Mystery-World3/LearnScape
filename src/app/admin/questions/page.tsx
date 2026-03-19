"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Search, CheckCircle2, Loader2, FileJson, Type, Hash, List, Filter } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, collectionGroup } from "firebase/firestore";
import { Question, Class, QuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function QuestionManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes } = useCollection<Class>(classesQuery);

  const questionsQuery = useMemoFirebase(() => collectionGroup(firestore, "questions"), [firestore]);
  const { data: questions, isLoading } = useCollection<Question>(questionsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isOpen, setIsOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [bulkData, setBulkData] = useState("");
  const [bulkClassId, setBulkClassId] = useState("");
  
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    classId: "",
    statement: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    correctAnswer: "",
    solutionSteps: [""]
  });

  const filteredQuestions = useMemo(() => {
    return (questions || []).filter(q => {
      const statement = q.statement || "";
      const className = classes?.find(c => c.id === q.classId)?.name || "";
      const search = searchTerm.toLowerCase();
      
      const matchSearch = statement.toLowerCase().includes(search) || className.toLowerCase().includes(search);
      const matchClass = classFilter === "all" || q.classId === classFilter;
      const matchType = typeFilter === "all" || q.type === typeFilter;
      
      return matchSearch && matchClass && matchType;
    });
  }, [questions, searchTerm, classFilter, typeFilter, classes]);

  const handleSave = () => {
    if (!formData.classId) return;
    const questionId = editingQuestion?.id || Math.random().toString(36).substr(2, 9);
    const docRef = doc(firestore, "classes", formData.classId, "questions", questionId);
    
    setDocumentNonBlocking(docRef, {
      ...formData,
      id: questionId,
      createdAt: editingQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    setIsOpen(false);
  };

  const handleBulkImport = () => {
    try {
      if (!bulkClassId) {
        toast({ title: "Kelas belum dipilih", variant: "destructive" });
        return;
      }
      const parsed = JSON.parse(bulkData);
      if (!Array.isArray(parsed)) throw new Error("Format harus berupa Array JSON");

      parsed.forEach((q: any) => {
        const questionId = Math.random().toString(36).substr(2, 9);
        const docRef = doc(firestore, "classes", bulkClassId, "questions", questionId);
        
        const mappedType: QuestionType = q.type === 'short-answer' ? 'text' : (q.type || 'multiple-choice');
        const statement = q.statement || q.text || "";
        const solutionSteps = Array.isArray(q.solutionSteps) ? q.solutionSteps : (q.explanation ? [q.explanation] : []);
        
        const finalData: any = {
          id: questionId,
          classId: bulkClassId,
          type: mappedType,
          statement: statement,
          solutionSteps: solutionSteps,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (mappedType === 'multiple-choice') {
          finalData.options = q.options || ["", "", "", ""];
          finalData.correctAnswerIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correctAnswerIndex || 0);
        } else {
          finalData.correctAnswer = q.correctAnswer?.toString() || "";
        }

        setDocumentNonBlocking(docRef, finalData, { merge: true });
      });

      toast({ title: "Berhasil!", description: `${parsed.length} soal telah diimpor.` });
      setIsBulkOpen(false);
      setBulkData("");
    } catch (e: any) {
      toast({ title: "Gagal Impor", description: "Pastikan format JSON benar. Error: " + e.message, variant: "destructive" });
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...(formData.options || ["", "", "", ""])];
    newOptions[idx] = val;
    setFormData({ ...formData, options: newOptions });
  };

  const handleStepChange = (idx: number, val: string) => {
    const newSteps = [...formData.solutionSteps];
    newSteps[idx] = val;
    setFormData({ ...formData, solutionSteps: newSteps });
  };

  const addStep = () => {
    setFormData({ ...formData, solutionSteps: [...formData.solutionSteps, ""] });
  };

  const removeStep = (idx: number) => {
    setFormData({ ...formData, solutionSteps: formData.solutionSteps.filter((_, i) => i !== idx) });
  };

  const handleDelete = (q: Question) => {
    if (confirm("Hapus pertanyaan ini?")) {
      const docRef = doc(firestore, "classes", q.classId, "questions", q.id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black">Manajemen Soal</h1>
          <p className="text-muted-foreground font-medium">Buat variasi soal pilihan ganda, angka, atau isian teks.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl h-12 shadow-sm">
                <FileJson className="h-5 w-5" /> Impor Masal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-black">Impor Masal Soal (JSON)</DialogTitle>
                <DialogDescription className="font-medium">Masukkan data soal dalam format array JSON yang didukung.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-bold">Pilih Kelas Target</Label>
                  <Select value={bulkClassId} onValueChange={setBulkClassId}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Pilih Kelas..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Data JSON</Label>
                  <Textarea 
                    value={bulkData} 
                    onChange={(e) => setBulkData(e.target.value)} 
                    placeholder='[{"text": "Soal...", "type": "multiple-choice", "options": ["A", "B"], "correctAnswer": 0}]'
                    className="font-mono text-xs h-64 rounded-xl border-2"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsBulkOpen(false)} className="rounded-xl">Batal</Button>
                <Button onClick={handleBulkImport} disabled={!bulkClassId || !bulkData} className="rounded-xl px-8">Impor Sekarang</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingQuestion(null);
                setFormData({ classId: "", type: "multiple-choice", statement: "", options: ["", "", "", ""], correctAnswerIndex: 0, correctAnswer: "", solutionSteps: [""] });
              }} className="gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" /> Tambah Soal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-black">{editingQuestion ? "Edit Pertanyaan" : "Buat Pertanyaan Baru"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Materi Kelas</Label>
                    <Select value={formData.classId} onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                      <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Tipe Soal</Label>
                    <Select value={formData.type} onValueChange={(val: QuestionType) => setFormData({ ...formData, type: val })}>
                      <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Pilih Tipe..." /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="multiple-choice">Pilihan Ganda</SelectItem>
                        <SelectItem value="number">Jawaban Angka</SelectItem>
                        <SelectItem value="text">Jawaban Teks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Pernyataan Soal</Label>
                  <Textarea value={formData.statement} onChange={(e) => setFormData({ ...formData, statement: e.target.value })} placeholder="Ketik soal di sini..." className="min-h-[120px] rounded-2xl border-2" />
                </div>

                {formData.type === "multiple-choice" ? (
                  <div className="space-y-4">
                    <Label className="font-bold">Opsi Jawaban (Klik lingkaran untuk kunci jawaban)</Label>
                    {formData.options?.map((opt, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, correctAnswerIndex: idx })} 
                          className={cn(
                            "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all", 
                            formData.correctAnswerIndex === idx ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "border-muted bg-muted/30"
                          )}
                        >
                          {formData.correctAnswerIndex === idx ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-black text-xs">{String.fromCharCode(65 + idx)}</span>}
                        </button>
                        <Input value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`} className="h-12 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="font-bold">Jawaban Benar ({formData.type === 'number' ? 'Hanya Angka' : 'Teks Bebas'})</Label>
                    <Input 
                      type={formData.type === 'number' ? 'number' : 'text'}
                      value={formData.correctAnswer} 
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })} 
                      placeholder="Masukkan kunci jawaban..." 
                      className="h-14 rounded-2xl border-2 border-primary/30 focus:border-primary"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-bold">Pembahasan Langkah-langkah</Label>
                    <Button variant="ghost" size="sm" onClick={addStep} className="h-9 px-4 rounded-xl text-xs gap-2 bg-secondary/50 hover:bg-secondary"><Plus className="h-4 w-4" /> Tambah Langkah</Button>
                  </div>
                  <div className="space-y-2">
                    {formData.solutionSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                        <Input value={step} onChange={(e) => handleStepChange(idx, e.target.value)} placeholder="Tulis langkah penyelesaian..." className="h-10 rounded-xl" />
                        <Button variant="ghost" size="icon" onClick={() => removeStep(idx)} className="rounded-xl h-10 w-10 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">Batal</Button>
                <Button onClick={handleSave} disabled={!formData.classId || !formData.statement} className="rounded-xl px-10">Simpan Soal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-card p-4 rounded-3xl border-2 shadow-sm">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Cari teks soal atau materi..." 
            className="pl-12 h-12 rounded-2xl border-none bg-secondary/20 focus:bg-secondary/40 transition-colors" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="lg:col-span-3 flex items-center gap-2 px-4 border-l-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="border-none shadow-none focus:ring-0 font-bold h-10">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-3 flex items-center gap-2 px-4 border-l-2">
          <List className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="border-none shadow-none focus:ring-0 font-bold h-10">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="multiple-choice">Pilihan Ganda</SelectItem>
              <SelectItem value="number">Jawaban Angka</SelectItem>
              <SelectItem value="text">Jawaban Teks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" /> 
          <p className="font-bold">Memuat bank soal...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="group shadow-lg hover:shadow-xl transition-all duration-300 border-none rounded-[2rem] overflow-hidden bg-card">
              <div className={cn(
                "h-2 w-full", 
                q.type === 'multiple-choice' ? 'bg-primary' : q.type === 'number' ? 'bg-orange-500' : 'bg-emerald-500'
              )} />
              <CardHeader className="pb-2 p-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="font-bold rounded-lg px-2 py-0.5 border-primary/20 bg-primary/5 text-primary">
                      {classes?.find(c => c.id === q.classId)?.name || "Materi"}
                    </Badge>
                    <Badge className={cn(
                      "gap-1.5 rounded-lg px-2 py-0.5 text-white border-none",
                      q.type === 'multiple-choice' ? 'bg-primary' : q.type === 'number' ? 'bg-orange-500' : 'bg-emerald-500'
                    )}>
                      {q.type === 'multiple-choice' ? <List className="h-3 w-3" /> : q.type === 'number' ? <Hash className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                      <span className="capitalize text-[10px] font-black tracking-wider">{(q.type || 'multiple-choice').replace('-', ' ')}</span>
                    </Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10" onClick={() => { setEditingQuestion(q); setFormData({ ...q }); setIsOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive rounded-xl hover:bg-destructive/10" onClick={() => handleDelete(q)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <CardTitle className="text-xl font-headline font-bold leading-tight mt-4 line-clamp-3">{q.statement || "Soal tanpa teks"}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                 {q.type === 'multiple-choice' ? (
                   <div className="space-y-2 mt-2">
                      {q.options?.map((opt, idx) => (
                        <div key={idx} className={cn(
                          "text-sm p-3 rounded-xl flex items-center gap-3 border-2 transition-colors", 
                          idx === q.correctAnswerIndex ? "bg-primary/5 border-primary/20 text-primary font-bold" : "bg-secondary/20 border-transparent"
                        )}>
                          <div className={cn(
                            "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black border-2",
                            idx === q.correctAnswerIndex ? "bg-primary border-primary text-white" : "border-muted-foreground/30 text-muted-foreground"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </div> 
                          {opt}
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="mt-4 p-4 bg-secondary/20 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Kunci Jawaban</span>
                      <span className="font-headline font-black text-xl text-primary">{q.correctAnswer}</span>
                   </div>
                 )}
              </CardContent>
            </Card>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-muted-foreground bg-secondary/10 rounded-[3rem] border-2 border-dashed">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Search className="h-10 w-10 opacity-20" />
              </div>
              <p className="font-bold text-lg">Tidak ada soal ditemukan.</p>
              <p className="text-sm">Coba sesuaikan filter atau pencarian Anda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
