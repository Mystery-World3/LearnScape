# LearnScape - LKPD Digital Interaktif

Aplikasi kuis matematika interaktif yang dibangun dengan Next.js, Tailwind CSS, dan Firebase.

## Panduan Deployment ke Vercel

Berdasarkan tampilan dashboard Vercel Anda, ikuti langkah ini:

### 1. Import Proyek
- Klik tombol **"Import"** pada bagian **"Import Project"** di dashboard Vercel.
- Pilih repository GitHub tempat Anda menyimpan kode ini.

### 2. Mengatur Environment Variables
Sebelum klik tombol **"Deploy"**, cari bagian **"Environment Variables"** dan masukkan kunci berikut satu per satu:

| Key (Nama Variabel) | Value (Ambil dari data di bawah) |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDY1askpWIaD9jssdPp4zC7lu8Syz8UOB4` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `studio-6468065292-dc3aa.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `studio-6468065292-dc3aa` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `studio-6468065292-dc3aa.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `647694388184` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:647694388184:web:8e2935f521a232668680ad` |

### 3. Selesaikan Deployment
- Setelah semua variabel dimasukkan, klik tombol **"Deploy"**.
- Vercel akan memproses aplikasi Anda dan memberikan link website yang sudah jadi.

## Persiapan Database (Firebase Console)
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pastikan **Firestore Database** sudah diaktifkan.
3. Pastikan **Authentication** (Anonymous) sudah diaktifkan di menu Build > Authentication > Sign-in method.

## Fitur Utama
- **Manajemen Kelas & Soal**: Guru dapat menambah/hapus materi kuis.
- **Kuis Interaktif**: Siswa mengerjakan kuis dengan progress bar.
- **Manajemen Nilai**: Skor disimpan otomatis ke Firestore.
- **Dashboard Statistik**: Visualisasi data performa siswa.
