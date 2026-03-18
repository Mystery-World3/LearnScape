# LearnScape - LKPD Digital Interaktif

Aplikasi kuis matematika interaktif yang dibangun dengan Next.js, Tailwind CSS, dan Firebase.

## Panduan Keamanan & Deployment

### 1. Keamanan di GitHub
Kunci API Firebase sekarang dikelola melalui **Environment Variables**. Ini artinya kode Anda aman untuk diunggah ke GitHub karena tidak berisi kunci asli secara langsung.

### 2. Konfigurasi di Vercel
Saat mendeploy ke Vercel, Anda **WAJIB** menambahkan variabel berikut di menu **Settings > Environment Variables**:

| Key | Value (Ambil dari Firebase Console) |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (API Key) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (Auth Domain) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (Project ID) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (App ID) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (Storage Bucket) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (Messaging Sender ID) |

### 3. Persiapan Database
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Aktifkan **Authentication** (Metode: Anonymous & Password).
3. Aktifkan **Firestore Database**.
4. Buat koleksi `teachers` dan tambahkan dokumen dengan ID sesuai UID akun Anda untuk akses admin.

## Fitur Utama
- **Manajemen Kelas & Soal**: Guru dapat menambah/hapus materi kuis.
- **Kuis Interaktif**: Siswa mengerjakan kuis dengan progress bar.
- **Manajemen Nilai**: Skor disimpan otomatis ke Firestore.
- **Dashboard Statistik**: Visualisasi data performa siswa.
