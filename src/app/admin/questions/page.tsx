"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Search, HelpCircle, CheckCircle2, Loader2, FileJson, AlertCircle, Type, Hash, List } from "lucide-react";
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
        setDocumentNonBlocking(docRef, {
          ...q,
          id: questionId,
          classId: bulkClassId,
          type: q.type || 'multiple-choice',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });

      toast({ title: "Berhasil!", description: `${parsed.length} soal telah diimpor.` });
      setIsBulkOpen(false);
      setBulkData("");
    } catch (e: any) {
      toast({ title: "Gagal Impor", description: e.message, variant: "destructive" });
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
          <h1 className="text-3xl font-headline font-bold">Manajemen Soal</h1>
          <p className="text-muted-foreground">Dukungan soal pilihan ganda, angka, dan isian teks.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileJson className="h-5 w-5" /> Impor Masal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Impor Masal Soal (JSON)</DialogTitle>
                <DialogDescription>Masukkan kode JSON berisi array soal untuk diimpor sekaligus.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Pilih Kelas Target</Label>
                  <Select value={bulkClassId} onValueChange={setBulkClassId}>
                    <SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
                    <SelectContent>
                      {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data JSON</Label>
                  <Textarea 
                    value={bulkData} 
                    onChange={(e) => setBulkData(e.target.value)} 
                    placeholder='[{"statement": "...", "type": "multiple-choice", "options": ["A", "B", ...], "correctAnswerIndex": 0, "solutionSteps": ["..."]}]'
                    className="font-mono text-xs h-64"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkOpen(false)}>Batal</Button>
                <Button onClick={handleBulkImport} disabled={!bulkClassId || !bulkData}>Impor Sekarang</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingQuestion(null);
                setFormData({ classId: "", type: "multiple-choice", statement: "", options: ["", "", "", ""], correctAnswerIndex: 0, correctAnswer: "", solutionSteps: [""] });
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
                  <div className="space-y-2">
                    <Label>Kelas</Label>
                    <Select value={formData.classId} onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                      <SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
                      <SelectContent>
                        {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipe Soal</Label>
                    <Select value={formData.type} onValueChange={(val: QuestionType) => setFormData({ ...formData, type: val })}>
                      <SelectTrigger><SelectValue placeholder="Pilih Tipe..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Pilihan Ganda</SelectItem>
                        <SelectItem value="number">Jawaban Angka</SelectItem>
                        <SelectItem value="text">Jawaban Teks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pernyataan Soal</Label>
                  <Textarea value={formData.statement} onChange={(e) => setFormData({ ...formData, statement: e.target.value })} placeholder="Soal matematika..." className="min-h-[100px]" />
                </div>

                {formData.type === "multiple-choice" ? (
                  <div className="space-y-3">
                    <Label>Opsi Jawaban</Label>
                    {formData.options?.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <button type="button" onClick={() => setFormData({ ...formData, correctAnswerIndex: idx })} className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center border-2", formData.correctAnswerIndex === idx ? "bg-primary border-primary text-primary-foreground" : "border-muted")}>
                          {formData.correctAnswerIndex === idx ? <CheckCircle2 className="h-5 w-5" /> : String.fromCharCode(65 + idx)}
                        </button>
                        <Input value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Jawaban Benar ({formData.type === 'number' ? 'Hanya Angka' : 'Teks Bebas'})</Label>
                    <Input 
                      type={formData.type === 'number' ? 'number' : 'text'}
                      value={formData.correctAnswer} 
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })} 
                      placeholder="Ketik jawaban benar di sini..." 
                      className="h-12 border-primary/50"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label>Pembahasan Langkah Demi Langkah</Label><Button variant="ghost" size="sm" onClick={addStep} className="h-8 text-xs gap-1"><Plus className="h-3 w-3" /> Tambah</Button></div>
                  {formData.solutionSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={step} onChange={(e) => handleStepChange(idx, e.target.value)} placeholder={`Langkah ke-${idx + 1}...`} />
                      <Button variant="ghost" size="icon" onClick={() => removeStep(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari soal atau materi..." className="pl-10 h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground"><Loader2 className="h-10 w-10 animate-spin mb-2" /> Memuat soal...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="shadow-lg hover:shadow-xl transition-shadow border-none overflow-hidden">
              <div className={cn("h-1 w-full", q.type === 'multiple-choice' ? 'bg-primary' : q.type === 'number' ? 'bg-yellow-500' : 'bg-green-500')} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <Badge variant="outline">{classes?.find(c => c.id === q.classId)?.name}</Badge>
                    <Badge className="gap-1">
                      {q.type === 'multiple-choice' ? <List className="h-3 w-3" /> : q.type === 'number' ? <Hash className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                      <span className="capitalize">{q.type?.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingQuestion(q); setFormData({ ...q }); setIsOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(q)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <CardTitle className="text-lg font-headline mt-2">{q.statement}</CardTitle>
              </CardHeader>
              <CardContent>
                 {q.type === 'multiple-choice' ? (
                   <div className="space-y-2">
                      {q.options?.map((opt, idx) => (
                        <div key={idx} className={cn("text-sm p-2 rounded flex items-center gap-2", idx === q.correctAnswerIndex ? "bg-primary/10 border border-primary/20 text-primary font-bold" : "bg-secondary/30")}>
                          <span className="opacity-50">{String.fromCharCode(65 + idx)}.</span> {opt}
                          {idx === q.correctAnswerIndex && <CheckCircle2 className="h-3 w-3 ml-auto" />}
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="p-3 bg-secondary/20 rounded-lg border-dashed border-2 flex items-center gap-2 font-mono text-sm">
                      <span className="text-muted-foreground">Kunci Jawaban:</span>
                      <span className="font-bold text-primary">{q.correctAnswer}</span>
                   </div>
                 )}
              </CardContent>
            </Card>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground italic">
              Belum ada soal ditambahkan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
