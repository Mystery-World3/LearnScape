# 🧠 LearnScape - LKPD Digital Interaktif

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Language](https://img.shields.io/badge/Language-TypeScript-blue)
![Framework](https://img.shields.io/badge/Framework-Next.js_15-black?logo=next.js)
![Database](https://img.shields.io/badge/Database-Firebase-orange?logo=firebase)
![Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

**LearnScape** adalah aplikasi Lembar Kerja Peserta Didik (LKPD) digital interaktif yang dirancang khusus untuk menunjang proses pembelajaran matematika. Aplikasi ini memungkinkan guru untuk mengelola materi dan soal secara dinamis, sementara siswa dapat menikmati pengalaman belajar yang modern, responsif, dan menyenangkan.

## 🔗 Live Demo
Coba aplikasinya langsung di sini:  
**[https://learn-scape-one.vercel.app/](https://learn-scape-one.vercel.app/)**

## 🚀 Fitur Utama

*   **Manajemen Kelas & Soal (Panel Guru):** Guru dapat menambah, mengedit, atau menghapus materi kelas dan bank soal dengan berbagai tipe (Pilihan Ganda, Jawaban Angka, dan Isian Teks).
*   **Kuis Interaktif (Siswa):** Antarmuka pengerjaan soal yang bersih dilengkapi dengan *progress bar* visual dan navigasi soal yang intuitif.
*   **Dashboard Statistik Real-time:** Visualisasi data performa siswa melalui grafik bar untuk memantau nilai rata-rata per materi secara instan.
*   **Manajemen Nilai & Ekspor:** Rekapitulasi nilai siswa otomatis yang dapat diedit dan diekspor langsung ke format CSV untuk keperluan administrasi.
*   **Mode Tema Solid:** Dukungan penuh untuk Mode Terang (*Light Mode*) dan Mode Gelap (*Dark Mode*) yang tersinkronisasi di seluruh halaman.
*   **Pintu Masuk Guru Tersembunyi:** Akses keamanan dashboard pengajar yang terintegrasi pada logo aplikasi untuk menjaga privasi dari siswa.

## 🛠️ Teknologi yang Digunakan

*   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
*   **UI Components:** Shadcn UI, Lucide React (Icons), Recharts (Statistik)
*   **Backend & Database:** Firebase Firestore (Real-time Database)
*   **Authentication:** Firebase Auth (Anonymous Sign-in)
*   **State Management:** React Hooks & LocalStorage Sync
*   **Deployment:** Vercel

## 💻 Cara Menjalankan Proyek Secara Lokal

Jika Anda ingin menjalankan aplikasi ini di komputer sendiri:

1.  **Clone repositori ini:**
    ```bash
    git clone https://github.com/Mystery-World3/LearnScape.git
    ```
2.  **Masuk ke direktori proyek:**
    ```bash
    cd LearnScape
    ```
3.  **Instal dependensi:**
    ```bash
    npm install
    ```
4.  **Konfigurasi Firebase:**
    Buat file `.env.local` di akar proyek dan masukkan konfigurasi Firebase Anda.
5.  **Jalankan aplikasi:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🤝 Kontribusi

Kontribusi sangat dihargai! Jika Anda ingin meningkatkan proyek ini, silakan:
1.  **Fork** repositori ini.
2.  Buat **Branch** fitur baru (`git checkout -b fitur-keren`).
3.  **Commit** perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4.  **Push** ke branch tersebut (`git push origin fitur-keren`).
5.  Buka **Pull Request**.

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.

---

## 👨‍💻 Author

**Muhammad Mishbahul Muflihin**  
*Information Technology Student | Darussalam Gontor University*  
Email: [mishbahulmuflihin@gmail.com](mailto:mishbahulmuflihin@gmail.com)
