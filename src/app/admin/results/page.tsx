"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, Edit2, User, Calendar, Loader2, Download, Filter } from "lucide-react";
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
    });
  }, [results, searchTerm, filterClassId]);

  const exportToCSV = () => {
    const headers = "Nama Siswa,Kelas,Skor,Tanggal\n";
    const rows = filteredResults.map(r => {
      const className = classes?.find(c => c.id === r.classId)?.name || "N/A";
      return `"${r.studentName}","${className}",${r.score},"${new Date(r.timestamp).toLocaleDateString()}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nilai_kuis_${new Date().toISOString().split('T')[0]}.csv`;
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
    if (confirm("Hapus data nilai ini?")) {
      const docRef = doc(firestore, "classes", r.classId, "quizAttempts", r.id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manajemen Nilai</h1>
          <p className="text-muted-foreground">Monitor dan ekspor hasil pengerjaan kuis siswa.</p>
        </div>
        <Button onClick={exportToCSV} className="gap-2" variant="outline" disabled={filteredResults.length === 0}>
          <Download className="h-4 w-4" /> Ekspor CSV
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="pb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari nama siswa..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <Filter className="h-4 w-4 text-muted-foreground" />
               <Select value={filterClassId} onValueChange={setFilterClassId}>
                 <SelectTrigger className="w-[200px]">
                   <SelectValue placeholder="Semua Kelas" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Semua Kelas</SelectItem>
                   {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mb-2" /> Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium"><div className="flex items-center gap-2"><User className="h-4 w-4 opacity-50" /> {r.studentName}</div></TableCell>
                    <TableCell><Badge variant="outline">{classes?.find(c => c.id === r.classId)?.name || "N/A"}</Badge></TableCell>
                    <TableCell><Badge className={cn(r.score >= 70 ? "bg-green-500" : "bg-destructive")}>{r.score}%</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(r)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ubah Data Nilai</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nama Siswa</Label><Input value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Skor (%)</Label><Input type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
