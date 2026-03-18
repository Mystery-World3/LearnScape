# LearnScape - LKPD Digital Interaktif

Aplikasi kuis matematika interaktif yang dibangun dengan Next.js, Tailwind CSS, dan Firebase.

## Panduan Deployment ke Vercel

Untuk mendeploy aplikasi ini ke Vercel, ikuti langkah-langkah berikut:

### 1. Persiapan Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Aktifkan **Authentication** (Metode: Anonymous & Password).
3. Aktifkan **Firestore Database** (Mode: Production atau Test).
4. Buat koleksi `classes` dan tambahkan beberapa data awal.

### 2. Konfigurasi Environment Variables di Vercel
Saat melakukan import project ke Vercel, tambahkan variabel berikut di bagian **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (Dari Firebase Project Settings) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (Dari Firebase Project Settings) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (Dari Firebase Project Settings) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (Dari Firebase Project Settings) |
| `GOOGLE_GENAI_API_KEY` | (Kunci API Google AI untuk fitur Genkit jika digunakan) |

### 3. Build & Deploy
Vercel akan secara otomatis mendeteksi Next.js. Anda cukup klik **Deploy**.

## Fitur Utama
- **Manajemen Kelas & Soal**: Guru dapat menambah/hapus materi kuis.
- **Kuis Interaktif**: Siswa mengerjakan kuis dengan progress bar.
- **Manajemen Nilai**: Skor disimpan otomatis ke Firestore.
- **Dashboard Statistik**: Visualisasi data performa siswa dengan Recharts.
