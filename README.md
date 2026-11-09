# Toko Digital — starter website

Website toko digital generik dengan katalog publik dan dashboard admin. Ini **bukan** situs resmi DANA dan tidak mengumpulkan PIN, OTP, password, atau kredensial dompet digital pelanggan.

## Menjalankan di komputer

1. Pasang Node.js versi 18 atau lebih baru.
2. Salin `.env.example` menjadi `.env`.
3. Buat hash password admin:
   ```bash
   node -e "const b=require('bcryptjs'); console.log(b.hashSync('GANTI_PASSWORD_KUAT',12))"
   ```
   Jalankan setelah `npm install`, lalu tempel hasil hash ke `ADMIN_PASSWORD_HASH`.
4. Isi `ADMIN_EMAIL` dan `JWT_SECRET` acak minimal 32 karakter di `.env`.
5. Jalankan:
   ```bash
   npm install
   npm start
   ```
6. Buka `http://localhost:3000` untuk toko dan `http://localhost:3000/admin` untuk admin.

## API key pembayaran milik sendiri

Bisa. Simpan `PAYMENT_API_BASE_URL` dan `PAYMENT_API_KEY` di `.env` pada server/hosting. Jangan masukkan API secret ke HTML, JavaScript browser, GitHub, atau chat. `.env` sudah masuk `.gitignore`.

Endpoint status hanya memeriksa apakah konfigurasi tersedia. **Pembayaran sungguhan belum aktif** karena tiap provider punya format API, signature, webhook, dan aturan berbeda. Sebelum menerima uang, tentukan provider resmi (misalnya Midtrans atau Xendit), gunakan dokumentasi resminya, aktifkan HTTPS, validasi signature webhook di server, dan uji di sandbox. Jangan mengaku pembayaran berhasil hanya dari redirect browser.

## Sebelum dipakai jualan sungguhan

- Deploy ke hosting yang mendukung Node.js (GitHub Pages hanya hosting statis dan tidak bisa menjalankan server login ini).
- Gunakan database terkelola dan backup; file JSON ini hanya untuk uji coba.
- Tambahkan halaman syarat layanan, kebijakan privasi, kontak, refund, dan informasi penjual.
- Jangan meminta PIN/OTP/password DANA atau bank pelanggan.
- Jangan meniru logo/halaman resmi DANA atau mengklaim afiliasi tanpa izin.
- Ganti seluruh secret contoh dan aktifkan HTTPS.
