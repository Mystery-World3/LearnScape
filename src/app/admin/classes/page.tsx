
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Search, BookOpen } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Class } from "@/lib/types";
import { MOCK_CLASSES } from "@/lib/mock-data";

export default function ClassManagement() {
  const [classes, setClasses] = useLocalStorage<Class[]>("classes", MOCK_CLASSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingClass) {
      setClasses(classes.map(c => c.id === editingClass.id ? { ...editingClass, ...formData } : c));
    } else {
      const newClass: Class = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        description: formData.description
      };
      setClasses([...classes, newClass]);
    }
    setIsOpen(false);
    setEditingClass(null);
    setFormData({ name: "", description: "" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini? Semua soal terkait juga akan terpengaruh.")) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manajemen Kelas</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus kategori kelas matematika.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingClass(null); setFormData({ name: "", description: "" }); }} className="gap-2">
              <Plus className="h-5 w-5" /> Tambah Kelas Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClass ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kelas</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Contoh: Aljabar Linear"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi</Label>
                <Input 
                  id="desc" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Deskripsi singkat..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari kelas..." 
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
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold text-primary flex items-center gap-2">
                    <BookOpen className="h-4 w-4 opacity-50" /> {c.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingClass(c);
                        setFormData({ name: c.name, description: c.description || "" });
                        setIsOpen(true);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                    Tidak ada kelas ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
