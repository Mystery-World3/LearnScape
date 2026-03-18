"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Search, HelpCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, collectionGroup } from "firebase/firestore";
import { Question, Class } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function QuestionManagement() {
  const firestore = useFirestore();
  
  // Ambil semua kelas untuk dropdown
  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes } = useCollection<Class>(classesQuery);

  // Ambil semua soal dari semua kelas menggunakan collectionGroup
  const questionsQuery = useMemoFirebase(() => collectionGroup(firestore, "questions"), [firestore]);
  const { data: questions, isLoading } = useCollection<Question>(questionsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    classId: "",
    statement: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    solutionSteps: [""]
  });

  const filteredQuestions = questions?.filter(q => 
    q.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classes?.find(c => c.id === q.classId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...formData.options];
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manajemen Soal</h1>
          <p className="text-muted-foreground">Buat pertanyaan kuis lengkap dengan pembahasan langkah-demi-langkah.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingQuestion(null);
              setFormData({ classId: "", statement: "", options: ["", "", "", ""], correctAnswerIndex: 0, solutionSteps: [""] });
            }} className="gap-2">
              <Plus className="h-5 w-5" /> Tambah Soal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Edit Pertanyaan" : "Buat Pertanyaan Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Kelas</Label>
                  <Select 
                    value={formData.classId} 
                    onValueChange={(val) => setFormData({ ...formData, classId: val })}
                  >
                    <SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
                    <SelectContent>
                      {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pernyataan Soal</Label>
                <Textarea 
                  value={formData.statement} 
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  placeholder="Masukkan soal matematika di sini..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label>Pilihan Jawaban (Centang untuk jawaban benar)</Label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, correctAnswerIndex: idx })}
                      className={cn(
                        "h-8 w-8 shrink-0 rounded-full flex items-center justify-center border-2 transition-all",
                        formData.correctAnswerIndex === idx ? "bg-primary border-primary text-primary-foreground" : "border-muted"
                      )}
                    >
                      {formData.correctAnswerIndex === idx ? <CheckCircle2 className="h-5 w-5" /> : String.fromCharCode(65 + idx)}
                    </button>
                    <Input 
                      value={opt} 
                      onChange={(e) => handleOptionChange(idx, e.target.value)} 
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Langkah Penyelesaian</Label>
                  <Button variant="ghost" size="sm" onClick={addStep} className="h-8 text-xs gap-1">
                    <Plus className="h-3 w-3" /> Tambah Langkah
                  </Button>
                </div>
                {formData.solutionSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="h-8 w-8 shrink-0 bg-secondary rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <Input 
                      value={step} 
                      onChange={(e) => handleStepChange(idx, e.target.value)} 
                      placeholder={`Langkah ke-${idx + 1}...`}
                    />
                    {formData.solutionSteps.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={() => removeStep(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={!formData.classId || !formData.statement}>Simpan Soal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari soal..." 
          className="pl-10 h-12 bg-white shadow-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          Memuat daftar soal...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="shadow-lg hover:shadow-xl transition-shadow border-none">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                    {classes?.find(c => c.id === q.classId)?.name || "Kelas Tidak Dikenal"}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingQuestion(q);
                      setFormData({ ...q });
                      setIsOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(q)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg font-headline mt-2">{q.statement}</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={cn(
                        "text-sm p-2 rounded flex items-center gap-2",
                        idx === q.correctAnswerIndex ? "bg-primary/10 border border-primary/20 text-primary font-bold" : "bg-secondary/30"
                      )}>
                        <span className="opacity-50">{String.fromCharCode(65 + idx)}.</span> {opt}
                        {idx === q.correctAnswerIndex && <CheckCircle2 className="h-3 w-3 ml-auto" />}
                      </div>
                    ))}
                 </div>
                 <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
                    <HelpCircle className="h-3 w-3" /> {q.solutionSteps.length} Langkah Pembahasan
                 </div>
              </CardContent>
            </Card>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-white rounded-3xl border border-dashed">
              Belum ada soal kuis.
            </div>
          )}
        </div>
      )}
    </div>
  );
}