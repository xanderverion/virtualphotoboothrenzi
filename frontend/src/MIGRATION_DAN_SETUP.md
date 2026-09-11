# Migrasi & Setup — Video, Wishes, Wedding Book, Memory Wall

## 1. Migrasi tabel `entries` di Supabase

Jalankan di SQL Editor Supabase:

```sql
alter table entries
  add column if not exists type text default 'photo',
  add column if not exists video_url text;

-- (opsional) isi data lama yang belum punya `type`
update entries set type = 'photo' where type is null;
```

`frame` dan `photo_url` boleh tetap nullable — untuk entry `wishes` keduanya
akan diisi `null`. Entry `video` akan mengisi `video_url`, `photo_url` tetap
`null`.

## 2. Bucket Storage baru: `Videos`

Di Supabase Dashboard → Storage:
1. Buat bucket baru bernama **`Videos`**.
2. Set **public** (sama seperti bucket `Photos` dan `Audio` yang sudah ada),
   supaya `getPublicUrl()` di kode langsung bisa dipakai tanpa signed URL.
3. Kalau ada Storage Policy khusus di bucket `Photos`/`Audio`, replikasi
   policy yang sama ke `Videos` (insert publik / anon key boleh upload).

## 3. File yang ditambahkan/diubah

**Baru:**
- `src/hooks/useVideoRecorder.js`
- `src/hooks/useFeedEntries.js`
- `src/components/capture/StepVideoCapture.jsx`
- `src/components/capture/StepWishes.jsx`
- `src/pages/WeddingBook.jsx` (route `/book`)
- `src/pages/MemoryWall.jsx` (route `/memory-wall`)

**Diubah:**
- `src/components/capture/StepInfo.jsx` — tambah selector Foto / Video / Wishes
- `src/components/capture/StepUploadAndSuccess.jsx` — dukung preview & download video
- `src/pages/Capture.jsx` — orkestrasi alur baru + upload ke bucket `Videos` + insert `type`
- `src/pages/Feed.jsx` — pakai `useFeedEntries`, tambah tautan ke Book & Memory Wall
- `src/components/feed/FeedCard.jsx` — render video (dengan ikon play) & wishes (kartu teks)
- `src/components/feed/FullViewModal.jsx` — render video & wishes di modal
- `src/App.jsx` — route `/book` dan `/memory-wall`
- `src/pages/Home.jsx` — tautan sekunder ke Wedding Book & Memory Wall

Semua path import mengasumsikan struktur folder yang sama seperti file asli
yang kamu kirim (`src/pages`, `src/components/capture`, `src/components/feed`,
`src/hooks`, `src/contexts`, `src/lib`, `src/constants`). Tinggal timpa file
lama dengan yang baru, dan tambahkan file-file baru di lokasi yang sesuai.

## 4. Yang perlu kamu cek sendiri

- **Izin kamera+mic untuk video**: `StepVideoCapture` minta `audio: true` di
  `<Webcam>`, terpisah dari `StepCamera` (foto) yang `audio: false`. Browser
  akan minta izin mikrofon tambahan saat masuk step video pertama kali.
- **Ukuran file video**: rekaman 10 detik biasanya di bawah beberapa MB, tapi
  cek limit upload Supabase Storage project kamu (default gratis: 50MB/file,
  seharusnya lebih dari cukup).
- **Wedding Book & Memory Wall** murni UI orisinal (bukan tiruan visual dari
  situs lain), tapi tetap pakai token desain (`--color-maroon`, `--color-cream`,
  font `font-couple`, dll) yang sudah ada di `index.css`, jadi otomatis
  konsisten dengan tema Minang yang sudah kamu punya.
- **`netflix-classic` / `netflix-movie`** di `frames.js` masih placeholder —
  belum saya sentuh karena di luar 4 fitur yang diminta. Bisa dikerjakan
  terpisah kalau mau.
