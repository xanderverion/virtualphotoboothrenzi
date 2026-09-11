<div align="center">

# 📸 Virtual Photobooth — Frontend

Aplikasi **React** untuk Virtual Photobooth pernikahan **Randy & Azizah**.  
Dibangun dengan **Vite**, **Tailwind CSS v4**, dan **Supabase** sebagai backend-as-a-service.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.111-3FCF8E?logo=supabase&logoColor=white)

</div>

---

## 📖 Deskripsi

Frontend ini merupakan Single Page Application (SPA) **mobile-first** yang berjalan dalam frame berukuran maksimum **480px** — tampil full screen di smartphone, dan dipusatkan (centered) di layar desktop. Aplikasi ini menyediakan fitur berfoto dengan bingkai kustom, merekam video ucapan, menulis pesan, serta melihat galeri momen dari seluruh tamu secara real-time.

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| [React](https://react.dev) | `^19.2.7` | UI library (hooks-based) |
| [Vite](https://vite.dev) | `^8.1.1` | Build tool, dev server, HMR |
| [Tailwind CSS](https://tailwindcss.com) | `^4.3.3` | Utility-first CSS via `@tailwindcss/vite` plugin |
| [React Router DOM](https://reactrouter.com) | `^7.18.1` | Client-side routing + `AnimatePresence` transitions |
| [Framer Motion](https://www.framer.com/motion/) | `^12.43.0` | Animasi transisi halaman & elemen UI |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | `^2.111.0` | Database queries & cloud storage (foto, video, audio) |
| [React Webcam](https://github.com/mozmorris/react-webcam) | `^7.2.0` | Akses kamera perangkat |
| [Lucide React](https://lucide.dev) | `^1.27.0` | Ikon SVG |
| [tsParticles](https://particles.js.org) | `^4.3.2` | Efek partikel pada loading screen |
| [Oxlint](https://oxc.rs) | `^1.71.0` | JavaScript/JSX linter (dev) |

---

## 📂 Struktur Direktori

```
frontend/
├── public/                         # Aset statis (langsung di-serve)
│   ├── Border-1-frame.png          # Frame foto: Single (1 foto)
│   ├── Border-2-frame.png          # Frame foto: Double (2 foto)
│   ├── Border-3-frame.png          # Frame foto: Triple (3 foto, strip 2x6in)
│   ├── Gallery3.jpg                # Foto galeri
│   ├── banner-gallery.jpg          # Banner halaman galeri
│   ├── photo-profile.jpg           # Foto profil pengantin
│   ├── video-journal.mp4           # Video journal pengantin
│   ├── wedding-journal-*.jpg/png   # Aset buku tamu / wedding book
│   ├── virtual-photobooth-icon.png # Favicon / app icon
│   └── _redirects                  # Redirect rules (Netlify / hosting SPA)
│
├── src/
│   ├── main.jsx                    # Entry point React → mount ke #root
│   ├── App.jsx                     # Root component: routing & layout
│   ├── App.css                     # Styling tambahan (non-Tailwind)
│   ├── index.css                   # 🎨 Design tokens & tema global (Tailwind @theme)
│   │
│   ├── pages/                      # Halaman utama (route-level components)
│   │   ├── Home.jsx                # Landing page — sambutan & navigasi
│   │   ├── Capture.jsx             # Alur capture multi-step (wizard)
│   │   ├── Feed.jsx                # Timeline/galeri semua entri tamu
│   │   ├── WeddingBook.jsx         # Buku tamu digital
│   │   ├── MemoryWall.jsx          # Galeri foto masonry
│   │   ├── BrideGallery.jsx        # Galeri foto pengantin
│   │   └── BrideQR.jsx             # QR Code untuk akses aplikasi
│   │
│   ├── components/                 # Komponen reusable
│   │   ├── LoadingScreen.jsx       # Splash screen dengan partikel
│   │   ├── GsapKit.jsx             # Utilitas animasi GSAP
│   │   │
│   │   ├── capture/                # Komponen alur Capture (step-by-step)
│   │   │   ├── StepChooseType.jsx       # Pilih jenis: foto / video / tulisan
│   │   │   ├── StepInfo.jsx             # Info & persiapan + pilih frame
│   │   │   ├── StepCamera.jsx           # Antarmuka kamera (foto)
│   │   │   ├── StepPhotoPreview.jsx     # Preview hasil foto + retake
│   │   │   ├── StepVideoCapture.jsx     # Antarmuka rekam video
│   │   │   ├── StepVoiceCapture.jsx     # Antarmuka rekam suara
│   │   │   ├── StepWishes.jsx           # Input teks ucapan
│   │   │   ├── StepAudioCaption.jsx     # Input caption + voice note
│   │   │   ├── StepPrinting.jsx         # Animasi "mencetak" foto ke frame
│   │   │   ├── StepUploadAndSuccess.jsx # Upload ke Supabase + layar sukses
│   │   │   └── CustomAudioPlayer.jsx    # Pemutar audio kustom
│   │   │
│   │   └── feed/                   # Komponen Feed
│   │       ├── FeedCard.jsx             # Kartu entri (foto/video/ucapan)
│   │       └── FullViewModal.jsx        # Modal tampilan penuh
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── usePhotoCapture.js      # Logika capture foto + canvas compositing
│   │   ├── useVideoRecorder.js     # Logika perekaman video (MediaRecorder)
│   │   ├── useAudioRecorder.js     # Logika perekaman audio / voice note
│   │   ├── useAudioPlayer.js       # Logika playback audio
│   │   ├── useFeedEntries.js       # Fetch & subscribe entri dari Supabase
│   │   └── useDeviceOrientation.js # Deteksi orientasi perangkat
│   │
│   ├── contexts/                   # React Context Providers
│   │   └── AlertContext.jsx        # Global alert/notification system
│   │
│   ├── constants/                  # Konstanta & konfigurasi
│   │   └── frames.js              # Definisi frame foto (posisi, aspek rasio, cutout)
│   │
│   ├── lib/                        # Library & client setup
│   │   ├── supabaseClient.js       # Inisialisasi Supabase client
│   │   └── utils.js                # Helper functions
│   │
│   └── utils/                      # Utilitas spesifik
│       ├── frameAspect.js          # Kalkulasi aspek rasio frame
│       └── imageComposite.js       # Canvas compositing foto + frame overlay
│
├── .env                            # Environment variables (Supabase credentials)
├── .oxlintrc.json                  # Konfigurasi Oxlint
├── vite.config.js                  # Konfigurasi Vite + plugins
├── index.html                      # HTML entry point
└── package.json                    # Dependencies & scripts
```

---

## 🗺️ Routing

Routing dikelola oleh **React Router DOM** v7 dengan transisi animasi via **Framer Motion** (`AnimatePresence`).

| Route | Halaman | Komponen | Deskripsi |
|---|---|---|---|
| `/` | Home | `Home.jsx` | Landing page — sambutan & CTA navigasi |
| `/capture` | Capture | `Capture.jsx` | Wizard multi-step: foto → video → tulisan |
| `/feed` | Feed | `Feed.jsx` | Timeline real-time semua entri tamu |
| `/book` | Wedding Book | `WeddingBook.jsx` | Buku tamu digital bergaya kenangan |
| `/memory-wall` | Memory Wall | `MemoryWall.jsx` | Galeri masonry semua foto |
| `/bride` | Bride Gallery | `BrideGallery.jsx` | Galeri foto pengantin |
| `/bride/qr` | Bride QR | `BrideQR.jsx` | QR Code untuk scan tamu |

---

## 🔄 Alur Capture (Multi-Step Wizard)

Halaman `/capture` menggunakan pola **step wizard** — setiap langkah dirender sebagai komponen terpisah yang bergantian ditampilkan:

```
StepChooseType → StepInfo → StepCamera / StepVideoCapture / StepWishes
                                 ↓
                          StepPhotoPreview → StepPrinting
                                 ↓
                     StepAudioCaption → StepUploadAndSuccess
```

| Step | Komponen | Fungsi |
|---|---|---|
| 1 | `StepChooseType` | Pilih jenis: 📷 Foto, 🎥 Video, atau ✍️ Tulisan |
| 2 | `StepInfo` | Persiapan — pilih desain frame (khusus foto) |
| 3a | `StepCamera` | Antarmuka kamera + shutter + retake |
| 3b | `StepVideoCapture` | Antarmuka rekam video |
| 3c | `StepWishes` | Input teks ucapan |
| 4 | `StepPhotoPreview` | Preview hasil foto dalam frame |
| 5 | `StepPrinting` | Animasi "mencetak" foto ke frame (canvas compositing) |
| 6 | `StepAudioCaption` | Input caption + rekam voice note (opsional) |
| 7 | `StepUploadAndSuccess` | Input nama, pilih privasi, upload ke Supabase, layar sukses |

---

## 🪝 Custom Hooks

| Hook | File | Deskripsi |
|---|---|---|
| `usePhotoCapture` | `hooks/usePhotoCapture.js` | Mengelola pengambilan foto via webcam, canvas rendering, dan compositing dengan frame overlay |
| `useVideoRecorder` | `hooks/useVideoRecorder.js` | Mengelola perekaman video menggunakan `MediaRecorder` API, termasuk start/stop/preview |
| `useAudioRecorder` | `hooks/useAudioRecorder.js` | Mengelola perekaman audio / voice note |
| `useAudioPlayer` | `hooks/useAudioPlayer.js` | Mengelola playback audio dengan kontrol play/pause/seek |
| `useFeedEntries` | `hooks/useFeedEntries.js` | Fetch daftar entri dari Supabase + realtime subscription |
| `useDeviceOrientation` | `hooks/useDeviceOrientation.js` | Mendeteksi orientasi perangkat (portrait/landscape) |

---

## 🖼️ Frame Foto

Aplikasi menyediakan **3 jenis frame** kustom bertema pernikahan:

| Frame | ID | Layout | Aspek Rasio | File |
|---|---|---|---|---|
| **Single Frame** | `border-1` | 1 foto | `2:3` | `Border-1-frame.png` |
| **Double Frame** | `border-2` | 2 foto (stacked) | `2:3` | `Border-2-frame.png` |
| **Triple Frame** | `border-3` | 3 foto (strip) | `2:6` | `Border-3-frame.png` |

Setiap frame memiliki konfigurasi presisi untuk:
- **`photoStyle` / `photoBoxes`** — Posisi & ukuran cutout foto dalam frame (diukur langsung dari file PNG)
- **`captureGuide`** — Area panduan di kamera agar hasil crop akurat dengan cutout frame

Compositing foto + frame dilakukan di sisi client menggunakan **Canvas API** (`utils/imageComposite.js`).

---

## 🎨 Design System

Tema visual dikonfigurasi melalui **Tailwind CSS `@theme`** directive di [`index.css`](src/index.css):

### Palet Warna

| Token | Hex | Peran |
|---|---|---|
| `canvas` | `#f7f2e9` | Background utama (broken-white hangat) |
| `panel` | `#efe4d3` | Surface nested / footer |
| `cream` | `#fffce1` | Teks terang, border |
| `maroon` | `#6b1420` | **Aksen utama** — CTA, heading, modal |
| `maroon-deep` | `#4c0e17` | Divider, footer accent |
| `accent-light` | `#9c3b48` | Hover state, variasi rose |
| `accent-soft` | `#f0dde0` | Bayangan rose pucat |

### Tipografi (Google Fonts)

| Token | Font | Peran |
|---|---|---|
| `--font-display` | Poppins | Judul halaman, teks hero |
| `--font-heading` | Montserrat | Header kartu, sub-judul |
| `--font-body` | Roboto | Paragraf, caption, tombol |
| `--font-inter` | Inter Tight | Alias body (legacy) |
| `--font-couple` | Birthstone | Nama pengantin ("Randy & Azizah") |
| `--font-playfair` | Great Vibes | Elemen kaligrafi elegan |

### Kontrol UI

| Class | Gaya |
|---|---|
| `.gradient-pill` | Tombol solid maroon, teks cream, pill-shaped (`border-radius: 100px`) |
| `.ghost-pill` | Tombol outline maroon, teks cream, pill-shaped |

---

## ☁️ Supabase Integration

Aplikasi terhubung ke **Supabase** untuk menyimpan dan mengambil data:

### Database

| Tabel | Kolom Utama | Deskripsi |
|---|---|---|
| `entries` | `id`, `type`, `name`, `caption`, `photo_url`, `video_url`, `audio_url`, `privacy`, `created_at` | Semua entri tamu (foto, video, ucapan) |

### Storage Buckets (Publik)

| Bucket | Konten |
|---|---|
| `Photos` | File foto hasil capture (dengan frame) |
| `Videos` | File video rekaman ucapan |
| `Audio` | File voice note |

### Environment Variables

| Variable | Deskripsi |
|---|---|
| `VITE_SUPABASE_URL` | URL proyek Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key Supabase |

---

## 🚀 Menjalankan Proyek

### Prasyarat

- **Node.js** ≥ 18
- **npm** ≥ 9

### Instalasi

```bash
npm install
```

### Environment Variables

Buat file `.env` di root folder `frontend/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Development

```bash
npm run dev
```

Akses di `http://localhost:5173`. Vite menyediakan Hot Module Replacement (HMR) untuk reload instan saat kode berubah.

### Production Build

```bash
npm run build
```

Output build akan berada di folder `dist/`. Preview build:

```bash
npm run preview
```

---

## 🧪 Scripts

| Script | Perintah | Deskripsi |
|---|---|---|
| `dev` | `npm run dev` | Jalankan dev server Vite (HMR) |
| `build` | `npm run build` | Build production bundle ke `dist/` |
| `preview` | `npm run preview` | Preview production build lokal |
| `lint` | `npm run lint` | Jalankan Oxlint untuk cek kualitas kode |

---

## 🔧 Konfigurasi

### Vite (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@tsparticles/react', '@tsparticles/engine', '@tsparticles/slim'],
  },
})
```

- **`@vitejs/plugin-react`** — Menggunakan [Oxc](https://oxc.rs) sebagai compiler (lebih cepat dari Babel/SWC)
- **`@tailwindcss/vite`** — Integrasi langsung Tailwind CSS v4 tanpa PostCSS manual
- **`optimizeDeps.include`** — Pre-bundle tsParticles agar tidak menyebabkan reload saat dev

### Oxlint (`.oxlintrc.json`)

Oxlint digunakan sebagai linter utama (pengganti ESLint) dengan performa yang lebih cepat.

---

## 📄 Dokumentasi Terkait

| Dokumen | Lokasi | Isi |
|---|---|---|
| **Design System** | [`DESIGN.md`](./DESIGN.md) | Dokumentasi lengkap sistem desain |
| **Migration & Setup** | [`src/MIGRATION_DAN_SETUP.md`](./src/MIGRATION_DAN_SETUP.md) | Catatan migrasi & setup teknis |
| **Root README** | [`../README.md`](../README.md) | Dokumentasi proyek keseluruhan (frontend + backend) |
| **Tutorial Pengguna** | [`../TUTORIAL_USER.md`](../TUTORIAL_USER.md) | Panduan penggunaan untuk tamu undangan |

---

<div align="center">

**Made with ❤️ by Renzi**

</div>
