# 💈 Leo-Curling (Cukur Keliling - Wanayasa & Sekitarnya)

> **Aplikasi Web Jasa Cukur Rambut On-Demand (Home Service) Berkonsep UI/UX Super Vintage Premium & Mobile-First.**

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-brightgreen.svg)]()
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)]()

---

## 📌 Ringkasan Aplikasi

**Leo-Curling (Cukur Keliling)** adalah aplikasi berbasis web yang dirancang untuk menerima pesanan jasa cukur rambut panggilan ke rumah (*home service*). Pengguna dapat memilih model gaya rambut Sunda Buhun, menginput alamat, dan membagikan titik lokasi presisi menggunakan peta interaktif (GPS Pin Marker), lalu tim cukur **Bang Leo** akan mendatangi lokasi tempat pelanggan.

---

## ✨ Fitur Unggulan

- **UI/UX Super Vintage Premium**: Tema warna kayu mahoni tua, kulit klasik, kertas kuno, stempel segel lilin (*wax seal*), dan animasi *barber pole* klasik.
- **Katalog Gaya Rambut Sunda Buhun (Pria & Wanita)**:
  - *Pria*: Gaya Ksatria Ciung Wanara, Gaya Prabu Siliwangi, Gaya Munding Laya, Gaya Baduy Kencana, Gaya Sangkuriang, Gaya Maung Bodas.
  - *Wanita*: Gaya Nyi Pohaci, Gaya Dayang Sumbi, Gaya Ratu Shima, Gaya Citra Rashmi, Gaya Galuh Pakuan, Gaya Purbararang.
- **Tarif Terjangkau**: Rp 20.000,- s/d Rp 40.000,-.
- **Area Pelayanan Presisi**: Khusus Kecamatan Wanayasa & Sekitarnya.
- **Peta Interaktif (GPS Pin Location)**: Integrasi Leaflet.js & OpenStreetMap untuk menentukan koordinat tempat penjemputan.
- **Struk Kuitansi Vintage & WhatsApp**: Otomatis memformat pesanan dan link koordinat Google Maps langsung ke WhatsApp Bang Leo (`0877 0069 2352`).
- **Dashboard Admin Tim Cukur**: Panel khusus untuk mengelola status pesanan (*Pending* $\rightarrow$ *Dalam Perjalanan* $\rightarrow$ *Sedang Dicukur* $\rightarrow$ *Selesai*) dan membuka petunjuk arah di Google Maps.
- **Mobile-First UX**: Dilengkapi *Sticky Mobile Bottom Navigation Bar* dan *thumb-friendly controls*.

---

## 🛠️ Teknologi Yang Digunakan

- **HTML5 & CSS3** (Vanilla Design System, Responsive Grid & Flexbox)
- **JavaScript (ES6 Modules & LocalStorage Persistence)**
- **Leaflet.js & CartoDB Voyager** (Peta Interaktif GPS)
- **FontAwesome 6** (Ikonografi)
- **Google Fonts** (*Playfair Display, Rye, Cinzel, Montserrat*)

---

## 🚀 Panduan Deploy Ke GitHub & GitHub Pages

### Langkah 1: Push Repository Ke GitHub

Jalankan perintah berikut di Terminal komputer Anda:

```bash
# 1. Tambahkan semua berkas ke git
git add .

# 2. Buat commit pertama
git commit -m "Initial commit - Leo-Curling Vintage Barber Web App"

# 3. Ubah nama branch utama ke main
git branch -M main

# 4. Hubungkan ke repository GitHub Anda (Ganti USERNAME dan REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 5. Push ke GitHub
git push -u origin main
```

---

### Langkah 2: Aktifkan GitHub Pages (Gratis Live Web Hosting)

1. Buka repositori proyek Anda di **GitHub.com**.
2. Masuk ke menu **Settings** > **Pages** (di bagian menu sebelah kiri).
3. Pada opsi **Build and deployment** > **Source**, pilih **Deploy from a branch**.
4. Di bagian **Branch**, pilih branch `main` dan folder `/ (root)`.
5. Klik **Save**.
6. Dalam hitungan detik, web **Leo-Curling** Anda akan langsung aktif secara publik pada URL:
   `https://USERNAME.github.io/REPO_NAME/`

---

## 💻 Menjalankan Secara Lokal

Cukup buka berkas `index.html` di browser Anda, atau jalankan local server:

```bash
npx serve ./
```

Akses via browser di `http://localhost:3000`.

---

## 📞 Kontak Admin
- **Founder & Barber Utama**: Bang Leo
- **WhatsApp**: [0877 0069 2352](https://wa.me/6287700692352)
- **Area**: Kecamatan Wanayasa & Sekitarnya

---
&copy; 2026 Leo-Curling (Cukur Keliling). All Rights Reserved.
