"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, Edit2, User, Calendar, Loader2, Download, Filter, FileText } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, collectionGroup } from "firebase/firestore";
import { QuizResult, Class } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ResultManagement() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<QuizResult | null>(null);
  const [formData, setFormData] = useState({ studentName: "", score: 0 });

  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes } = useCollection<Class>(classesQuery);

  const resultsQuery = useMemoFirebase(() => collectionGroup(firestore, "quizAttempts"), [firestore]);
  const { data: results, isLoading } = useCollection<QuizResult>(resultsQuery);

  const filteredResults = useMemo(() => {
    return (results || []).filter(r => {
      const matchSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = filterClassId === "all" || r.classId === filterClassId;
      return matchSearch && matchClass;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [results, searchTerm, filterClassId]);

  const exportToCSV = () => {
    const headers = "Nama Siswa,Kelas,Skor,Tanggal\n";
    const rows = filteredResults.map(r => {
      const className = classes?.find(c => c.id === r.classId)?.name || "N/A";
      return `"${r.studentName}","${className}",${r.score},"${new Date(r.timestamp).toLocaleDateString('id-ID')}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nilai_Kuis_LearnScape_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleEdit = (result: QuizResult) => {
    setEditingResult(result);
    setFormData({ studentName: result.studentName, score: result.score });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingResult) return;
    const docRef = doc(firestore, "classes", editingResult.classId, "quizAttempts", editingResult.id);
    setDocumentNonBlocking(docRef, { ...editingResult, studentName: formData.studentName, score: formData.score }, { merge: true });
    setIsEditDialogOpen(false);
  };

  const handleDelete = (r: QuizResult) => {
    if (confirm("Hapus data nilai ini secara permanen?")) {
      const docRef = doc(firestore, "classes", r.classId, "quizAttempts", r.id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline font-black">Manajemen Nilai</h1>
          <p className="text-muted-foreground text-sm font-medium">Pantau hasil belajar dan unduh laporan nilai siswa.</p>
        </div>
        <Button onClick={exportToCSV} className="w-full md:w-auto gap-2 rounded-xl shadow-lg h-11 md:h-12 px-6" variant="outline" disabled={filteredResults.length === 0}>
          <Download className="h-5 w-5" /> Ekspor ke CSV
        </Button>
      </div>

      <Card className="shadow-lg md:shadow-xl border-none rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Cari nama siswa..." 
                className="pl-12 h-11 md:h-12 rounded-xl border-2 focus:ring-primary/20 text-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-2 bg-card p-1 md:p-1.5 px-3 md:px-4 rounded-xl border-2 transition-all hover:border-primary/50">
               <Filter className="h-4 w-4 text-muted-foreground" />
               <Select value={filterClassId} onValueChange={setFilterClassId}>
                 <SelectTrigger className="w-full md:w-[200px] border-none shadow-none focus:ring-0 font-bold h-9">
                   <SelectValue placeholder="Pilih Kelas" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl">
                   <SelectItem value="all">Semua Kelas</SelectItem>
                   {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              Memuat data nilai...
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6 md:px-8 font-black uppercase text-[10px] md:text-xs">Nama Siswa</TableHead>
                    <TableHead className="font-black uppercase text-[10px] md:text-xs">Materi Kelas</TableHead>
                    <TableHead className="font-black uppercase text-[10px] md:text-xs">Skor Akhir</TableHead>
                    <TableHead className="font-black uppercase text-[10px] md:text-xs">Waktu</TableHead>
                    <TableHead className="text-right px-6 md:px-8 font-black uppercase text-[10px] md:text-xs">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((r) => (
                    <TableRow key={r.id} className="hover:bg-secondary/5 transition-colors">
                      <TableCell className="px-6 md:px-8 py-4 font-bold text-sm md:text-base">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="truncate max-w-[150px]">{r.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5 text-primary text-[10px] md:text-xs truncate max-w-[150px]">
                          {classes?.find(c => c.id === r.classId)?.name || "Kuis Terhapus"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center justify-center h-8 w-12 md:h-10 md:w-16 rounded-lg md:rounded-xl font-headline font-black text-sm md:text-lg",
                          r.score >= 70 ? "bg-emerald-500 text-white" : "bg-destructive text-white"
                        )}>
                          {r.score}%
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right px-6 md:px-8">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} className="rounded-lg h-8 w-8 md:h-9 md:w-9 hover:bg-primary/10">
                            <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive rounded-lg h-8 w-8 md:h-9 md:w-9 hover:bg-destructive/10" onClick={() => handleDelete(r)}>
                            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium text-sm">
                        Belum ada data nilai terkumpul.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[1.5rem] md:rounded-[2rem] max-w-[95vw] sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl md:text-2xl font-headline font-black">Ubah Data Nilai</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm">Nama Lengkap Siswa</Label>
              <Input value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="rounded-xl h-12 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm">Skor Hasil Akhir (%)</Label>
              <Input type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} className="rounded-xl h-12 text-sm" />
            </div>
          </div>
          <DialogFooter className="flex flex-col md:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl w-full md:w-auto">Batal</Button>
            <Button onClick={handleSaveEdit} className="rounded-xl px-8 w-full md:w-auto">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
