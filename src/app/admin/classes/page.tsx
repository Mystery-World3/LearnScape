"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, Search, BookOpen, Loader2, Power, Filter } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Class } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClassManagement() {
  const firestore = useFirestore();
  const classesQuery = useMemoFirebase(() => collection(firestore, "classes"), [firestore]);
  const { data: classes, isLoading } = useCollection<Class>(classesQuery);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", isActive: true });

  const filteredClasses = classes?.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && c.isActive) || 
                         (statusFilter === "inactive" && !c.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleSave = () => {
    const classId = editingClass?.id || Math.random().toString(36).substr(2, 9);
    const docRef = doc(firestore, "classes", classId);
    
    setDocumentNonBlocking(docRef, {
      id: classId,
      name: formData.name,
      description: formData.description,
      isActive: formData.isActive,
      createdAt: editingClass?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    setIsOpen(false);
    setEditingClass(null);
    setFormData({ name: "", description: "", isActive: true });
  };

  const toggleStatus = (c: Class) => {
    const docRef = doc(firestore, "classes", c.id);
    setDocumentNonBlocking(docRef, { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini? Semua soal di dalamnya juga akan terpengaruh.")) {
      const docRef = doc(firestore, "classes", id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manajemen Kelas</h1>
          <p className="text-muted-foreground">Aktifkan atau nonaktifkan materi kuis untuk siswa.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingClass(null); setFormData({ name: "", description: "", isActive: true }); }} className="gap-2">
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
              <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                <div className="space-y-0.5">
                  <Label>Status Aktif</Label>
                  <p className="text-xs text-muted-foreground">Siswa hanya bisa melihat kelas yang aktif.</p>
                </div>
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={!formData.name}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari nama kelas..." 
                className="pl-10 h-11" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-secondary/20 p-1 px-3 rounded-lg border">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-none shadow-none focus:ring-0 h-9">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Hanya Aktif</SelectItem>
                  <SelectItem value="inactive">Hanya Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              Memuat data kelas...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-primary">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 opacity-50 text-foreground" /> 
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "default" : "secondary"} className={cn(c.isActive ? "bg-green-500 hover:bg-green-600" : "opacity-50")}>
                        {c.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{c.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(c)} title={c.isActive ? "Nonaktifkan" : "Aktifkan"}>
                          <Power className={cn("h-4 w-4", c.isActive ? "text-green-500" : "text-muted-foreground")} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingClass(c);
                          setFormData({ name: c.name, description: c.description || "", isActive: c.isActive });
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
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                      Tidak ada kelas yang sesuai dengan filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
