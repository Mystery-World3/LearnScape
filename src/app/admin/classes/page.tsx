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
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
      const docRef = doc(firestore, "classes", id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black">Manajemen Kelas</h1>
          <p className="text-muted-foreground font-medium">Aktifkan materi yang akan ditampilkan pada halaman siswa.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingClass(null); setFormData({ name: "", description: "", isActive: true }); }} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> Tambah Kelas Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-black">{editingClass ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">Nama Kelas</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Contoh: Matematika Kelas X"
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="font-bold">Deskripsi Singkat</Label>
                <Input 
                  id="desc" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Deskripsi materi..."
                  className="rounded-xl h-12"
                />
              </div>
              <div className="flex items-center justify-between p-4 border-2 rounded-2xl bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="font-bold">Status Aktif</Label>
                  <p className="text-xs text-muted-foreground font-medium">Tampilkan kelas ini di halaman siswa.</p>
                </div>
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} 
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">Batal</Button>
              <Button onClick={handleSave} disabled={!formData.name} className="rounded-xl px-8">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-xl border-none rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Cari nama kelas..." 
                className="pl-12 h-12 rounded-xl border-2 focus:ring-primary/20" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-card p-1.5 px-4 rounded-xl border-2 transition-all hover:border-primary/50">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] border-none shadow-none focus:ring-0 font-bold h-9">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              Memuat data kelas...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="px-8 font-black uppercase text-xs">Nama Kelas</TableHead>
                  <TableHead className="font-black uppercase text-xs">Status</TableHead>
                  <TableHead className="font-black uppercase text-xs">Deskripsi</TableHead>
                  <TableHead className="text-right px-8 font-black uppercase text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((c) => (
                  <TableRow key={c.id} className="hover:bg-secondary/5 transition-colors">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-base">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "default" : "secondary"} className={cn("rounded-lg px-3 py-1 font-bold", c.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "opacity-60")}>
                        {c.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium max-w-xs truncate">{c.description || "-"}</TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(c)} title={c.isActive ? "Nonaktifkan" : "Aktifkan"} className="rounded-lg h-9 w-9">
                          <Power className={cn("h-4 w-4", c.isActive ? "text-emerald-500" : "text-muted-foreground")} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingClass(c);
                          setFormData({ name: c.name, description: c.description || "", isActive: c.isActive });
                          setIsOpen(true);
                        }} className="rounded-lg h-9 w-9">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive rounded-lg h-9 w-9 hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClasses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic font-medium">
                      Tidak ada kelas ditemukan.
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
