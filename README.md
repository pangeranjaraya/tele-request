# REQ FEATURE / REQ BOT — GitHub + Vercel

Website Vite dengan formulir request, nomor tiket, riwayat request, pusat pengumuman, FAQ, panel pengelolaan lokal, notifikasi Telegram, dan latar partikel pseudo-3D ringan. Tidak memakai Supabase, Firebase, SQLite, Termux, atau server yang harus dinyalakan di HP.

## Fitur yang tersedia

- Landing page responsif dengan animasi partikel pseudo-3D berbasis Canvas (tanpa library tambahan; mengikuti preferensi reduced-motion).
- Profil pengguna: nama, ID Telegram numerik, URL foto opsional.
- Formulir request dengan kategori, judul, detail, dan tujuan notifikasi owner/channel.
- Nomor tiket unik untuk setiap pengiriman; status awal `Menunggu`.
- Notifikasi Telegram lewat Vercel Function `api/notify.js`.
- Riwayat tiket di dashboard pengguna, termasuk status, waktu, dan status pengiriman notifikasi.
- Pusat pengumuman dan FAQ dengan data awal yang bisa dibaca pengunjung.
- Panel admin `/?owner=1`: melihat tiket yang tersimpan di browser tersebut, mengubah status/catatan owner, ekspor JSON, menambah/menghapus pengumuman, serta menambah/menghapus FAQ.
- Semua input yang ditampilkan di HTML di-escape sebelum dirender untuk mengurangi risiko injeksi markup.

## Batasan penting — baca sebelum deploy

Proyek ini sengaja tidak memakai database bersama. Profil, tiket, status tiket, pengumuman, dan FAQ yang diedit disimpan di `localStorage` browser.

- `localStorage` hanya tersedia di browser/perangkat yang menyimpannya. Data tidak tersinkron lintas pengunjung atau lintas perangkat dan dapat hilang jika data browser dibersihkan.
- Ketika pengunjung membuat request, Vercel Function mencoba mengirim notifikasi ke Telegram. Tiket lokal tetap dibuat meskipun Telegram gagal, tetapi UI menunjukkan kegagalannya.
- Panel `/?owner=1` hanya dapat melihat/mengelola tiket yang tersimpan pada browser yang sama. Membuka panel dari HP owner yang berbeda tidak akan menampilkan request pengunjung lain.
- Perubahan status di panel admin hanya akan tampak di riwayat user jika data berada di browser yang sama. Ini bukan dashboard admin global.
- Panel admin `/?owner=1` tidak memiliki autentikasi server. Jangan anggap URL ini sebagai area admin privat atau gunakan untuk data sensitif.
- Pengumuman/FAQ yang diedit lewat panel admin hanya tersimpan di browser yang mengeditnya; tidak otomatis dipublikasikan kepada semua pengunjung.

Agar semua request bisa dikelola owner dari perangkat berbeda dan status tersinkron ke user, dibutuhkan penyimpanan server bersama serta autentikasi admin. GitHub + Vercel static frontend + localStorage saja tidak bisa menyediakan sinkronisasi global yang persisten.

## Konfigurasi Telegram

Edit `api/config.js` sebelum deploy:

```js
export const OWNER = {
  name: 'NAMA_OWNER',
  telegramId: 'ID_TELEGRAM_OWNER',
  role: 'Owner',
};

export const TELEGRAM_CHANNEL_ID = '-100ISI_ID_CHANNEL_DI_SINI'; // ganti dengan ID channel kamu
```

Di Vercel → Project Settings → Environment Variables, tambahkan `TELEGRAM_BOT_TOKEN` dengan token BotFather. Jangan commit token asli ke GitHub. Owner harus membuka bot lalu mengirim `/start`. Tujuan request default adalah channel. Isi `TELEGRAM_CHANNEL_ID` dengan ID channel numerik yang benar (biasanya diawali `-100`) dan jadikan bot admin channel dengan izin mengirim pesan. Backend mengirim teks biasa agar karakter khusus pada request tidak membuat parse Markdown gagal.

## Deploy dari HP melalui GitHub + Vercel

1. Ekstrak ZIP ini dan unggah seluruh isi folder proyek ke repository GitHub (termasuk `api/` dan `src/`).
2. Import repository ke Vercel.
3. Framework preset: **Vite**; build command `npm run build`; output directory `dist`.
4. Tambahkan `TELEGRAM_BOT_TOKEN` pada Environment Variables Vercel.
5. Isi identitas owner/channel di `api/config.js`, commit perubahan, lalu deploy ulang.
6. Uji kirim request. Bila Telegram gagal, lihat pesan error yang ditampilkan dan periksa konfigurasi/token/izin bot.

## Pengujian

Sebelum rilis, jalankan `npm install` lalu `npm run build`. Pengiriman Telegram harus diuji setelah token asli dan konfigurasi owner/channel disiapkan. Pemeriksaan sintaks lokal tidak membuktikan pengiriman Telegram berhasil.
# tele-request
