
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Trash2, Edit2, Trophy, User, Calendar } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { QuizResult, Class } from "@/lib/types";
import { MOCK_RESULTS, MOCK_CLASSES } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ResultManagement() {
  const [results, setResults] = useLocalStorage<QuizResult[]>("quiz_results", MOCK_RESULTS);
  const [classes] = useLocalStorage<Class[]>("classes", MOCK_CLASSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<QuizResult | null>(null);
  const [formData, setFormData] = useState({ studentName: "", score: 0 });

  const filteredResults = results.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classes.find(c => c.id === r.classId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (result: QuizResult) => {
    setEditingResult(result);
    setFormData({ studentName: result.studentName, score: result.score });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingResult) return;
    setResults(results.map(r => 
      r.id === editingResult.id 
        ? { ...r, studentName: formData.studentName, score: formData.score } 
        : r
    ));
    setIsEditDialogOpen(false);
    setEditingResult(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus data nilai ini? Tindakan ini tidak dapat dibatalkan.")) {
      setResults(results.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-headline font-bold">Kelola Nilai Siswa</h1>
        <p className="text-muted-foreground">Lihat dan kelola hasil kuis yang telah diselesaikan oleh siswa.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama siswa atau kelas..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredResults.map((r) => {
                const className = classes.find(c => c.id === r.classId)?.name || "N/A";
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 opacity-50" />
                        {r.studentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {className}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(r.score >= 70 ? "bg-primary" : "bg-destructive")}>
                        {r.score}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(r.timestamp).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Tidak ada data nilai ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Data Nilai</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Siswa</Label>
              <Input 
                id="edit-name" 
                value={formData.studentName} 
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-score">Skor (%)</Label>
              <Input 
                id="edit-score" 
                type="number"
                min="0"
                max="100"
                value={formData.score} 
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
