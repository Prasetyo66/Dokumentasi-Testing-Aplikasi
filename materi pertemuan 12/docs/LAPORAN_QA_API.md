# DOKUMENTASI PENGUJIAN PERANGKAT LUNAK

## Pendekatan Keyword-Driven Testing Berdasarkan ISO/IEC/IEEE 29119-5:2024

### Pengujian API Black-Box — Website Balai Penilaian Kompetensi (`https://www.balaipensi.my.id`)

---

## 1. Identitas Dokumen

| | Keterangan |
|---|---|
| Nama sistem/aplikasi | Portal Layanan Terpadu & Layanan Kepuasan Masyarakat — Balai Penilaian Kompetensi (SIRAMEN KREDIBEL) |
| Organisasi/Unit | Balai Penilaian Kompetensi, Kementerian Pekerjaan Umum |
| Disusun oleh | Mahasiswa Penyusun — [isi nama] / [isi NIM] |
| Tanggal | 24 November 2026 |
| Versi dokumen | 1.0 |
| Status | Draf |
| Metode | Black-Box Testing pada lapisan API/web service |
| Alat | Postman 11 (perancangan koleksi) dan Newman 6.2.3 (eksekusi CLI) |
| Objek uji | `https://www.balaipensi.my.id` |
| Artefak pendukung | `postman/balaipensi_api_qa.postman_collection.json`, `postman/env.postman_environment.json`, `evidence/newman_result.json`, `evidence/newman_cli.txt` |

---

## 2. Pendahuluan

### 2.1 Tujuan

Dokumen ini digunakan untuk merencanakan, merancang, mengelompokkan, melaksanakan, dan mendokumentasikan pengujian API pada Website Balai Penilaian Kompetensi dengan pendekatan *Keyword-Driven Testing* (KDT). Setiap langkah pengujian direpresentasikan oleh *keyword* yang memiliki makna tindakan tertentu (misalnya `VERIFIKASI_STATUS`, `VERIFIKASI_STRUKTUR_JSON`, `VERIFIKASI_WAKTU_RESPONS`), sehingga skenario uji bersifat modular, dapat dibaca ulang, dan dapat dieksekusi otomatis melalui Newman.

Pengujian ini menjawab pertanyaan: **apakah kontrak respons API/web endpoint objek uji sesuai dengan spesifikasi yang diharapkan, termasuk penanganan masukan tidak valid, kontrol akses, dan waktu respons?**

### 2.2 Acuan standar dan batas cakupan

Acuan utama dokumen adalah **ISO/IEC/IEEE 29119-5:2024**, *Software and Systems Engineering — Software Testing — Part 5: Keyword-Driven Testing*. Seperti pada template dokumentasi ISO 29119-5, klausul 6.6 menjelaskan hubungan KDT dengan *Test Design and Implementation Process* yang terdiri atas TD1 sampai TD6.

Catatan penting: ISO/IEC/IEEE 29119-5 menyatakan bahwa **TD1 (Identify Feature Sets), TD2 (Derive Test Conditions), dan TD3 (Derive Test Coverage Items)** dapat diterapkan sebagaimana dijelaskan dalam ISO/IEC/IEEE 29119-2, tetapi tidak dibahas secara rinci dalam Bagian 5. Penerapan KDT yang dibahas khusus adalah **TD4 (Derive Test Cases), TD5 (Assemble Test Sets), dan TD6 (Derive Test Procedures)**. Karena itu, bagian TD1–TD3 dalam laporan ini merupakan lembar kerja pendukung, bukan rincian persyaratan yang dijabarkan oleh Bagian 5.

Standar pendukung yang dipetakan pada Bagian 12:

1. **ISO/IEC 25010:2023** — model kualitas produk (functional suitability, performance efficiency, security, reliability, dan seterusnya).
2. **ISO/IEC/IEEE 29119-1:2022** — konsep, prinsip, dan kosakata pengujian (*test item*, *test basis*, *test condition*, *test case*, *test data*, *expected result*, *actual result*).
3. **ISO/IEC 27001:2022** — pengendalian keamanan informasi, akses, dan perlindungan data pribadi selama pengujian.

### 2.3 Informasi sistem yang diuji

| Informasi | Isian |
|---|---|
| Nama aplikasi | Portal Layanan Terpadu Balai Penilaian Kompetensi dan aplikasi survei "Yanlik" |
| Versi/build | Tidak dipublikasikan oleh pemilik sistem (tidak ada penanda versi pada respons/HTML) |
| Jenis aplikasi | Aplikasi web berbasis PHP (server-side rendered) dengan satu endpoint AJAX JSON |
| Lingkungan pengujian | Windows, Node.js v22.20.0, Newman 6.2.3, jaringan internet publik, TLS/HTTPS (HTTP/1.1 dengan `alt-svc: h3`) |
| Server | `DomaiNesia` (header `Server`), sesi PHP (`PHPSESSID`) |
| URL utama | `https://www.balaipensi.my.id` → 302 ke `/sso/index.php` |
| Fitur/endpoint dalam cakupan | `/`, `/index.php`, `/sso/`, `/sso/index.php`, `/sso/login.php`, `/sso/dashboard.php`, `/sso/logout.php`, `/login.php`, `/yanlik/`, `/yanlik/login.php`, `/yanlik/admin.php`, `/yanlik/get_pegawai.php`, `/yanlik/proses.php`, `/yanlik/simpan.php`, halaman 404, serta header keamanan dan waktu respons |
| Di luar cakupan | Pengujian beban/stres konkuren (bukan kapasitas produksi), pengujian penetrasi menyeluruh, pengujian UI visual, pengujian kirim data survei valid, dan aksi POST yang mengubah data admin. Alasan: berisiko menambah/mengubah data produksi dan tidak tersedianya akun uji resmi. |

### 2.4 Konsep pengujian API yang diterapkan (Pertemuan 12)

Materi Pertemuan 12 menegaskan bahwa *"Pengujian API (API Testing) adalah proses yang dilakukan untuk memvalidasi bahwa Application Programming Interface (API) bekerja sesuai dengan spesifikasi yang ditetapkan"* (Fauzi, t.t., hlm. 327). Materi yang sama menyatakan bahwa *"Dalam pengujian API, elemen utama yang diuji adalah respons dari API terhadap permintaan yang dikirimkan oleh klien, termasuk memastikan bahwa data yang dikirim dan diterima sudah benar, sesuai dengan format yang diharapkan, serta menangani error dengan tepat"* (hlm. 327).

Konsep tersebut diterjemahkan menjadi empat kelompok validasi pada setiap request:

| Konsep Pertemuan 12 | Implementasi pada koleksi |
|---|---|
| Pengujian berbasis permintaan–respons, metode HTTP GET/POST/HEAD/OPTIONS | 38 request dengan metode GET, POST, HEAD, dan OPTIONS |
| Validasi status kode | Keyword `VERIFIKASI_STATUS` (`pm.response.to.have.status(...)`) |
| Validasi struktur/body respons | Keyword `VERIFIKASI_STRUKTUR_JSON` dan `VERIFIKASI_STRUKTUR_HTML` |
| Validasi waktu respons (kinerja) | Keyword `VERIFIKASI_WAKTU_RESPONS` (ambang 3000 ms halaman, 2000 ms API) |
| Pengujian keamanan (autentikasi/otorisasi) | Test set TS-API-04, TS-API-05, TS-API-07 |
| Penanganan galat/input tidak valid | Skenario negatif: parameter hilang, kredensial salah, metode salah, payload injeksi |
| Postman + Newman untuk otomatisasi | Koleksi diekspor JSON dan dijalankan CLI Newman dengan reporter `cli,json` |

Materi juga menekankan bahwa *"Newman adalah command-line runner untuk menjalankan koleksi Postman ... memungkinkan pengujian otomatis koleksi Postman ... sebagai bagian dari pipeline CI/CD"* (hlm. 352), dan bahwa tantangan utama pengujian API adalah *"memastikan bahwa respons API divalidasi dengan benar. Respons API mencakup kode status (status code), pesan, header, dan body"* (hlm. 354). Keduanya menjadi dasar pemilihan alat dan bentuk assertion pada laporan ini.

---

## 3. Urutan Pekerjaan Pengujian

| Tahap | Nama tahap | Pekerjaan yang dilakukan | Keluaran |
|---|---|---|---|
| TD1 | Identify Feature Sets | Inventarisasi halaman, endpoint, dan perilaku yang dapat diakses publik; enumerasi endpoint terkait (`/sso/`, `/yanlik/`, `/yanlik/admin.php`, `get_pegawai.php`) | Daftar fitur F-01…F-09 (Bagian 4) |
| TD2 | Derive Test Conditions | Menurunkan kondisi positif, negatif, batas, dan keamanan dari setiap fitur | Daftar kondisi K-001…K-024 (Bagian 5) |
| TD3 | Derive Test Coverage Items | Menentukan aspek yang harus tercakup: status, header, struktur body, waktu, kontrol akses, injeksi | Daftar cakupan C-001…C-020 (Bagian 6) |
| TD4 | Derive Test Cases | Menyusun prasyarat, data masukan, urutan keyword, dan hasil yang diharapkan | 38 test case TC-API-001…TC-API-038 (Bagian 7) |
| TD5 | Assemble Test Sets | Mengelompokkan test case per area fungsi dan folder koleksi Postman | 8 test set TS-API-01…TS-API-08 (Bagian 8) |
| TD6 | Derive Test Procedures | Menyusun urutan eksekusi, perintah Newman, dan cara merekam bukti | Prosedur TP-API-001…TP-API-003 (Bagian 9) |

---

## 4. TD1 — Identifikasi Fitur (Lembar Kerja Pendukung)

| ID fitur | Nama fitur/endpoint | Deskripsi fungsi | Dalam cakupan? | Catatan |
|---|---|---|---|---|
| F-01 | `GET /` dan `/index.php` | Mengarahkan pengunjung ke portal layanan | Ya | Respons 302 ke `/sso/index.php` |
| F-02 | `GET /sso/` dan `/sso/index.php` | Portal layanan publik dan tautan aplikasi | Ya | Directory index berfungsi |
| F-03 | `GET /sso/login.php` | Form login pegawai (SSO) | Ya | Memuat field `username`, `password` |
| F-04 | `GET/POST /login.php` | Form login admin lama | Ya | Ditemukan perilaku 500 pada POST tidak valid |
| F-05 | `GET /yanlik/` | Form survei kepuasan masyarakat | Ya | Field `nama_penilai`, `nip_penilai`, `id_karyawan`, `kepuasan` |
| F-06 | `GET /yanlik/get_pegawai.php?q=` | Endpoint AJAX JSON autocomplete pegawai | Ya | Mengembalikan `nama_pegawai` dan `nip` |
| F-07 | `GET/POST /yanlik/admin.php` | Panel admin survei (dashboard, karyawan, pegawai, survey) | Ya | Diuji akses tanpa sesi; aksi ubah data tidak dijalankan |
| F-08 | `GET /sso/dashboard.php`, `/sso/logout.php` | Halaman internal dan logout SSO | Ya | Diuji perilaku tanpa sesi |
| F-09 | `GET /yanlik/proses.php`, `/yanlik/simpan.php` | Handler pemrosesan/penyimpanan | Ya (negatif) | `proses.php` 200 body kosong; `simpan.php` 404 |
| F-10 | Header keamanan & transport | HSTS, header proteksi, cookie sesi | Ya | Non-fungsional keamanan |
| F-11 | Waktu respons | Efisiensi kinerja endpoint | Ya | Non-fungsional kinerja |
| F-12 | Pengiriman survei valid & CRUD admin | Menyimpan penilaian/petugas baru | Tidak | Berisiko membuat data produksi palsu; tidak ada akun uji resmi |

---

## 5. TD2 — Kondisi Pengujian (Lembar Kerja Pendukung)

| ID kondisi | ID fitur | Kondisi yang diuji | Jenis kondisi | Hasil yang diharapkan |
|---|---|---|---|---|
| K-001 | F-01 | Root domain diakses | Positif | 302 ke `/sso/index.php` |
| K-002 | F-02 | Portal diakses langsung dan melalui directory index | Positif | 200, konten portal tampil |
| K-003 | F-02 | Path tidak terdaftar diakses | Negatif | 404 Not Found |
| K-004 | F-02 | Metadata respons diminta dengan HEAD | Positif | 200, HSTS tersedia |
| K-005 | F-03 | Form login SSO dibuka | Positif | 200, field lengkap |
| K-006 | F-04 | Form login admin dibuka | Positif | 200, field lengkap |
| K-007 | F-08 | Dashboard SSO diakses tanpa sesi | Negatif | 302 ke login |
| K-008 | F-08 | Logout dipanggil tanpa sesi | Negatif | 302 ke login |
| K-009 | F-06 | Kata kunci valid | Positif | 200, array JSON berisi objek |
| K-010 | F-06 | Kata kunci tidak cocok | Negatif | 200, array kosong |
| K-011 | F-06 | Parameter `q` tidak dikirim | Negatif | 400 Bad Request |
| K-012 | F-06 | Kata kunci 1 karakter | Batas | Perilaku konsisten/terdokumentasi |
| K-013 | F-06 | Karakter kutip tunggal | Negatif | Tidak ada galat SQL |
| K-014 | F-06 | Payload SQL injection | Keamanan | Tidak mengeksekusi injeksi |
| K-015 | F-06 | Payload XSS | Keamanan | Tidak dipantulkan mentah |
| K-016 | F-06 | Metode POST ke endpoint baca | Negatif | 405 Method Not Allowed |
| K-017 | F-06 | Kata kunci 300 karakter | Batas | Tidak 5xx, JSON valid |
| K-018 | F-03 | Kredensial SSO salah | Negatif | Form + pesan galat |
| K-019 | F-03 | Kredensial SSO kosong | Validasi | 4xx |
| K-020 | F-04 | Kredensial admin salah | Negatif | 200/401 + pesan, bukan 5xx |
| K-021 | F-07 | Panel admin diakses tanpa sesi (4 modul) | Keamanan | 302/401/403 |
| K-022 | F-05 | Form survei tanpa field wajib | Validasi | Pesan validasi, tanpa simpan |
| K-023 | F-09 | Handler proses diakses dengan GET | Negatif | 405/400 + body penjelas |
| K-024 | F-10, F-11 | Header proteksi, cookie, HTTPS, waktu respons | Keamanan/kinerja | Header lengkap, cookie aman, respons < ambang |

---

## 6. TD3 — Item Cakupan Pengujian (Lembar Kerja Pendukung)

| ID cakupan | ID fitur/kondisi | Item yang dicakup | Keterangan / batas cakupan |
|---|---|---|---|
| C-001 | F-01 / K-001 | Status dan header `Location` root | Hanya respons redirect, bukan isi halaman tujuan |
| C-002 | F-02 / K-002 | Status, `Content-Type`, judul, tautan portal | Pemeriksaan string kunci, bukan seluruh DOM |
| C-003 | F-02 / K-003 | Status 404 dan tipe konten galat | Halaman 404 bawaan hosting |
| C-004 | F-03, F-04 / K-005, K-006 | Keberadaan field form login | Tanpa uji kredensial valid |
| C-005 | F-08 / K-007, K-008 | Redirect proteksi sesi | Tanpa cookie sesi valid |
| C-006 | F-06 / K-009 | Struktur array dan tipe field JSON | Tidak menyimpan nilai nama/NIP |
| C-007 | F-06 / K-010 | Array kosong untuk hasil nihil | - |
| C-008 | F-06 / K-011 | Kontrak parameter wajib | - |
| C-009 | F-06 / K-012, K-017 | Batas panjang kata kunci | 1 dan 300 karakter |
| C-010 | F-06 / K-013–K-015 | Ketahanan masukan berbahaya | Uji permukaan, bukan audit menyeluruh |
| C-011 | F-06 / K-016 | Pembatasan metode HTTP | - |
| C-012 | F-03 / K-018, K-019 | Autentikasi negatif SSO | Kredensial sintetis |
| C-013 | F-04 / K-020 | Autentikasi negatif admin | Kredensial sintetis |
| C-014 | F-07 / K-021 | Kontrol akses empat modul admin | Hanya GET, tanpa aksi ubah data |
| C-015 | F-05 / K-022 | Validasi sisi server form survei | Tanpa data lengkap |
| C-016 | F-09 / K-023 | Semantik handler pemrosesan | GET/POST kosong |
| C-017 | F-10 / K-024 | HSTS, CSP, XCTO, XFO, atribut cookie | Cookie diperiksa via curl (lihat Lampiran C) |
| C-018 | F-11 / K-024 | Waktu respons per request | Bukan uji beban konkuren |
| C-019 | F-06 / K-016, K-023 | Header `Allow` pada OPTIONS | Konformansi HTTP |
| C-020 | F-01–F-09 | Konsistensi status code seluruh endpoint | Rekapitulasi 38 request |

---

## 7. TD4 — Menurunkan Test Case Berbasis Keyword

Bagian ini mengikuti penjelasan 6.6.5 ISO/IEC/IEEE 29119-5 tentang penurunan test case dari keyword sederhana maupun *composite keyword*. Keyword didefinisikan lebih dahulu, lalu dipakai ulang pada seluruh test case.

### 7.1 Prasyarat (Pre-conditions)

| ID test case | Prasyarat sebelum pengujian | Cara menyiapkan / keyword terkait |
|---|---|---|
| TC-API-001…TC-API-038 | Koneksi internet stabil; DNS `www.balaipensi.my.id` resolve; Newman 6.2.3 terpasang; environment `env.postman_environment.json` dimuat | `BUKA_TERMINAL` → `MUAT_ENVIRONMENT` |
| TC-API-021…TC-API-024 | Data kredensial sintetis tersedia dan **bukan** akun nyata | `SIAPKAN_DATA_DUMMY` |
| TC-API-025…TC-API-028 | Tidak ada sesi login aktif (cookie jar bersih) | `GUNAKAN_SESI_KOSONG` |
| TC-API-030 | Tidak mengirim data survei lengkap agar tidak membuat baris data | `KIRIM_FORM_TIDAK_LENGKAP` |

### 7.2 Data masukan (Input Values)

| ID data | Field/parameter | Nilai masukan | Kategori | Catatan |
|---|---|---|---|---|
| D-001 | `q` | `an` | Valid | Kata kunci umum, bukan identitas individu |
| D-002 | `q` | `zzzz_tidak_ada_qa_2026` | Tidak valid | Uji hasil kosong |
| D-003 | `q` | `a` | Batas | 1 karakter |
| D-004 | `q` | `'` | Tidak valid | Karakter khusus |
| D-005 | `q` | `' OR '1'='1` | Keamanan | SQL injection |
| D-006 | `q` | `<script>alert(1)</script>` | Keamanan | XSS |
| D-007 | `q` | 300 karakter `a` | Batas | Panjang berlebih |
| D-008 | `username` | `qa_dummy_user_2026` | Tidak valid | **Sintetis**, bukan akun nyata |
| D-009 | `password` | `QaDummy#2026!` | Tidak valid | **Sintetis** |
| D-010 | body login | kosong | Tidak valid | Uji validasi server |
| D-011 | `simpan` | `1` (tanpa field lain) | Tidak valid | Uji validasi survei |
| D-012 | path | `/halaman-tidak-ada-qa-2026` | Tidak valid | Uji 404 |

### 7.3 Daftar keyword

| Nama keyword | Tujuan/tindakan | Parameter | Hasil/keluaran |
|---|---|---|---|
| `BUKA_ENDPOINT` | Menyusun URL dari `baseUrl` + path | path, query | URL siap kirim |
| `KIRIM_GET` | Mengirim permintaan GET | - | Respons HTTP |
| `KIRIM_POST_FORM` | Mengirim POST `application/x-www-form-urlencoded` | pasangan kunci-nilai | Respons HTTP |
| `KIRIM_HEAD` | Mengambil metadata respons | - | Header respons |
| `KIRIM_OPTIONS` | Menanyakan metode yang didukung | - | Header `Allow` (diharapkan) |
| `VERIFIKASI_STATUS` | Memeriksa kode status HTTP | kode yang diharapkan | PASS/FAIL |
| `VERIFIKASI_STRUKTUR_JSON` | Memeriksa tipe array/objek dan field wajib | skema field | PASS/FAIL |
| `VERIFIKASI_STRUKTUR_HTML` | Memeriksa string kunci pada HTML | teks yang diharapkan | PASS/FAIL |
| `VERIFIKASI_HEADER` | Memeriksa header respons | nama header | PASS/FAIL |
| `VERIFIKASI_REDIRECT` | Memeriksa status 3xx dan `Location` | tujuan | PASS/FAIL |
| `VERIFIKASI_WAKTU_RESPONS` | Membandingkan `responseTime` dengan ambang | ambang ms | PASS/FAIL |
| `VERIFIKASI_KEAMANAN` | Memeriksa kontrol akses, kebocoran galat, header, injeksi | kriteria | PASS/FAIL |

### 7.4 Spesifikasi test case

| ID | Kondisi/tujuan | Prasyarat | Data input | Urutan keyword | Expected result |
|---|---|---|---|---|---|
| TC-API-001 | Redirect root ke portal | Sesi kosong | - | BUKA_ENDPOINT → KIRIM_GET → VERIFIKASI_REDIRECT → VERIFIKASI_WAKTU_RESPONS | 302, `Location` memuat `/sso/index.php`, < 3000 ms |
| TC-API-002 | Portal tampil | - | - | KIRIM_GET → VERIFIKASI_STATUS → VERIFIKASI_STRUKTUR_HTML | 200, judul portal dan tautan login ada |
| TC-API-003 | Directory index `/sso/` | - | - | KIRIM_GET → VERIFIKASI_STATUS | 200, konten portal |
| TC-API-004 | `/index.php` dialihkan internal | - | - | KIRIM_GET → VERIFIKASI_STATUS | 200 setelah redirect |
| TC-API-005 | Path tidak ada | - | D-012 | KIRIM_GET → VERIFIKASI_STATUS | 404 |
| TC-API-006 | Metadata portal | - | - | KIRIM_HEAD → VERIFIKASI_HEADER | 200, HSTS ada |
| TC-API-007 | Form login SSO | - | - | KIRIM_GET → VERIFIKASI_STRUKTUR_HTML | 200, field `username`/`password` |
| TC-API-008 | Form login admin | - | - | KIRIM_GET → VERIFIKASI_STRUKTUR_HTML | 200, judul Login Admin |
| TC-API-009 | Form login admin survei | - | - | KIRIM_GET → VERIFIKASI_STRUKTUR_HTML | 200, form login |
| TC-API-010 | Dashboard tanpa sesi | Sesi kosong | - | KIRIM_GET → VERIFIKASI_REDIRECT | 302 ke `login.php` |
| TC-API-011 | Logout tanpa sesi | Sesi kosong | - | KIRIM_GET → VERIFIKASI_REDIRECT | 302 ke `login.php` |
| TC-API-012 | Pencarian pegawai valid | - | D-001 | KIRIM_GET → VERIFIKASI_STRUKTUR_JSON → VERIFIKASI_WAKTU_RESPONS | 200, array berisi, tiap item punya `nama_pegawai` & `nip` string |
| TC-API-013 | Pencarian nihil | - | D-002 | KIRIM_GET → VERIFIKASI_STRUKTUR_JSON | 200, array kosong |
| TC-API-014 | Parameter wajib hilang | - | - | KIRIM_GET → VERIFIKASI_STATUS | 400 |
| TC-API-015 | Kata kunci 1 karakter | - | D-003 | KIRIM_GET → VERIFIKASI_STRUKTUR_JSON | 200, array JSON |
| TC-API-016 | Karakter kutip tunggal | - | D-004 | KIRIM_GET → VERIFIKASI_KEAMANAN | Tidak 5xx, tanpa galat SQL |
| TC-API-017 | SQL injection | - | D-005 | KIRIM_GET → VERIFIKASI_KEAMANAN | Tidak mengembalikan seluruh data |
| TC-API-018 | XSS | - | D-006 | KIRIM_GET → VERIFIKASI_KEAMANAN | `<script` tidak dipantulkan |
| TC-API-019 | Metode POST ke endpoint baca | - | D-001 | KIRIM_POST_FORM → VERIFIKASI_STATUS | 405 |
| TC-API-020 | Kata kunci 300 karakter | - | D-007 | KIRIM_GET → VERIFIKASI_STATUS | Tidak 5xx, JSON valid |
| TC-API-021 | Login SSO salah | Data dummy | D-008, D-009 | KIRIM_POST_FORM → VERIFIKASI_STRUKTUR_HTML | 200, pesan galat, tanpa sesi |
| TC-API-022 | Login SSO kosong | - | D-010 | KIRIM_POST_FORM → VERIFIKASI_STATUS | 4xx |
| TC-API-023 | Login admin salah | Data dummy | D-008, D-009 | KIRIM_POST_FORM → VERIFIKASI_STATUS | 200/401, body berisi pesan |
| TC-API-024 | Login admin kosong | - | D-010 | KIRIM_POST_FORM → VERIFIKASI_STATUS | Tidak 5xx |
| TC-API-025 | Dashboard admin tanpa sesi | Sesi kosong | - | KIRIM_GET → VERIFIKASI_KEAMANAN | 302/401/403 |
| TC-API-026 | Modul karyawan tanpa sesi | Sesi kosong | - | KIRIM_GET → VERIFIKASI_KEAMANAN | Ditolak, form tidak tampil |
| TC-API-027 | Modul pegawai tanpa sesi | Sesi kosong | - | KIRIM_GET → VERIFIKASI_KEAMANAN | Ditolak, tanpa NIP |
| TC-API-028 | Laporan survei tanpa sesi | Sesi kosong | - | KIRIM_GET → VERIFIKASI_KEAMANAN | Ditolak, laporan tidak tampil |
| TC-API-029 | Form survei tampil | - | - | KIRIM_GET → VERIFIKASI_STRUKTUR_HTML | 200, field wajib lengkap |
| TC-API-030 | Survei tanpa field wajib | - | D-011 | KIRIM_POST_FORM → VERIFIKASI_STRUKTUR_HTML | Tanpa 5xx, ada pesan validasi, tanpa konfirmasi simpan |
| TC-API-031 | Endpoint simpan tidak ada | - | - | KIRIM_GET → VERIFIKASI_STATUS | 404 |
| TC-API-032 | Handler proses via GET | - | - | KIRIM_GET → VERIFIKASI_STATUS | 405/400, body penjelas |
| TC-API-033 | Pemaksaan HTTPS | - | - | KIRIM_GET (http) → VERIFIKASI_REDIRECT | 301 ke `https://` |
| TC-API-034 | Header proteksi login | - | - | KIRIM_GET → VERIFIKASI_HEADER → VERIFIKASI_KEAMANAN | HSTS, XCTO, CSP, XFO tersedia |
| TC-API-035 | Header cache halaman sesi | - | - | KIRIM_GET → VERIFIKASI_HEADER | `no-store`, `Pragma: no-cache` |
| TC-API-036 | Kinerja halaman survei | - | - | KIRIM_GET → VERIFIKASI_WAKTU_RESPONS | < 3000 ms |
| TC-API-037 | Kinerja endpoint AJAX | - | D-001 | KIRIM_GET → VERIFIKASI_WAKTU_RESPONS | < 2000 ms |
| TC-API-038 | OPTIONS endpoint AJAX | - | - | KIRIM_OPTIONS → VERIFIKASI_HEADER | 200/204, `Allow` memuat GET |

---

## 8. TD5 — Menggabungkan Test Case menjadi Test Set

| ID test set | Nama test set (folder Postman) | ID test case | Kriteria pengelompokan | Lingkungan |
|---|---|---|---|---|
| TS-API-01 | Portal & Routing Publik | TC-API-001…006 | Fungsi routing dan halaman publik | HTTPS, tanpa sesi |
| TS-API-02 | Halaman Login & Sesi | TC-API-007…011 | Form login dan proteksi sesi | HTTPS, tanpa sesi |
| TS-API-03 | Endpoint AJAX get_pegawai | TC-API-012…020 | Satu endpoint JSON dan variasinya | HTTPS, query string |
| TS-API-04 | Autentikasi Negatif | TC-API-021…024 | Autentikasi dengan data sintetis | HTTPS, kredensial dummy |
| TS-API-05 | Kontrol Akses Panel Admin | TC-API-025…028 | Otorisasi empat modul admin | HTTPS, tanpa sesi |
| TS-API-06 | Form Survei & Endpoint Proses | TC-API-029…032 | Validasi form dan handler | HTTPS, data tidak lengkap |
| TS-API-07 | Header Keamanan & Transport | TC-API-033…035 | Non-fungsional keamanan | HTTP dan HTTPS |
| TS-API-08 | Kinerja Respons | TC-API-036…038 | Non-fungsional kinerja dan OPTIONS | HTTPS |

---

## 9. TD6 — Menurunkan Test Procedure

| ID prosedur | Urutan | Test set / test case | Langkah pelaksanaan | Catatan |
|---|---|---|---|---|
| TP-API-001 | 1 | Seluruh | Pastikan Node.js dan Newman tersedia (`newman --version` → 6.2.3) | Tanpa dependensi proyek |
| TP-API-001 | 2 | Seluruh | Impor `postman/balaipensi_api_qa.postman_collection.json` dan `postman/env.postman_environment.json` | Dapat juga langsung via CLI |
| TP-API-001 | 3 | Seluruh | Jalankan perintah: `newman run postman/balaipensi_api_qa.postman_collection.json -e postman/env.postman_environment.json -r cli,json --reporter-json-export evidence/newman_result.json` | Urutan folder = urutan eksekusi |
| TP-API-001 | 4 | Seluruh | Simpan keluaran CLI ke `evidence/newman_cli.txt`; periksa ringkasan assertion | Exit code 1 jika ada assertion gagal |
| TP-API-002 | 1 | TS-API-01…08 | Analisis `evidence/newman_result.json`: hitung assertion, status code, waktu respons, dan daftar kegagalan | Data mentah dianalisis sebelum sanitasi |
| TP-API-002 | 2 | Seluruh | Jalankan `node scripts/sanitize_newman_evidence.js` untuk menghapus body respons, cookie, dan pola NIP | Wajib sebelum commit |
| TP-API-002 | 3 | Seluruh | Verifikasi tidak ada pola 16–18 digit dan tidak ada JSON `nama_pegawai` pada evidence | Script menolak jika masih ditemukan |
| TP-API-003 | 1 | TC-API-025…028, TC-API-035 | Verifikasi manual header `Set-Cookie` dengan `curl -D -` karena Postman/Newman tidak mengekspos `Set-Cookie` pada `pm.response.headers` | Hasil dicatat di Lampiran C |
| TP-API-003 | 2 | Seluruh | Susun laporan pada `docs/LAPORAN_QA_API.md` dan petakan ke standar ISO | Dokumen ini |

**Perintah eksekusi aktual (sesuai tugas):**

```bash
newman run postman/balaipensi_api_qa.postman_collection.json \
  -e postman/env.postman_environment.json \
  -r cli,json --reporter-json-export evidence/newman_result.json
```

Eksekusi aktual: **24 November 2026, 00.27 WIB** (start `2026-11-23T17:27:58Z`), durasi total **13,4 detik**, exit code **1** karena terdapat assertion yang gagal (perilaku normal Newman ketika ada kegagalan).

---

## 10. Catatan Pelaksanaan Pengujian

Kolom *actual result* mencatat hasil yang diamati, bukan salinan *expected result*. Status ditentukan per test case: **FAIL** bila satu atau lebih assertion gagal.

| Waktu | ID test case | Tester | Actual result | Status | Bukti |
|---|---|---|---|---|---|
| 00.27 WIB | TC-API-001 | QA | HTTP 302, `Location: /sso/index.php`, 539 ms | PASS | `newman_result.json` exec 001 |
| 00.27 WIB | TC-API-002 | QA | HTTP 200, `text/html`, 8,7 kB, 168 ms | PASS | exec 002 |
| 00.27 WIB | TC-API-003 | QA | HTTP 200, 296 ms | PASS | exec 003 |
| 00.27 WIB | TC-API-004 | QA | HTTP 200 setelah redirect, 318 ms | PASS | exec 004 |
| 00.27 WIB | TC-API-005 | QA | HTTP 404, 191 ms | PASS | exec 005 |
| 00.27 WIB | TC-API-006 | QA | HTTP 200, HSTS ada, 475 ms | PASS | exec 006 |
| 00.27 WIB | TC-API-007 | QA | HTTP 200, field login lengkap, 379 ms | PASS | exec 007 |
| 00.27 WIB | TC-API-008 | QA | HTTP 200, 147 ms | PASS | exec 008 |
| 00.27 WIB | TC-API-009 | QA | HTTP 200, 112 ms | PASS | exec 009 |
| 00.27 WIB | TC-API-010 | QA | HTTP 302 → `login.php`, 205 ms | PASS | exec 010 |
| 00.27 WIB | TC-API-011 | QA | HTTP 302 → `login.php`, 211 ms | PASS | exec 011 |
| 00.27 WIB | TC-API-012 | QA | HTTP 200, JSON array berisi, struktur sesuai, 243 ms | PASS | exec 012 |
| 00.27 WIB | TC-API-013 | QA | HTTP 200, `[]`, 159 ms | PASS | exec 013 |
| 00.27 WIB | TC-API-014 | QA | **HTTP 200 dengan `[]`**, bukan 400 | **FAIL** (1/3) | exec 014 |
| 00.27 WIB | TC-API-015 | QA | HTTP 200, array berisi untuk 1 karakter | PASS | exec 015 |
| 00.27 WIB | TC-API-016 | QA | HTTP 200, JSON valid, tanpa galat SQL, 408 ms | PASS | exec 016 |
| 00.27 WIB | TC-API-017 | QA | HTTP 200, `[]` (injeksi tidak berhasil) | PASS | exec 017 |
| 00.27 WIB | TC-API-018 | QA | HTTP 200, `[]`, tanpa `<script` | PASS | exec 018 |
| 00.27 WIB | TC-API-019 | QA | **HTTP 200 dengan `[]`**, bukan 405 | **FAIL** (1/2) | exec 019 |
| 00.27 WIB | TC-API-020 | QA | HTTP 200, `[]`, 221 ms | PASS | exec 020 |
| 00.27 WIB | TC-API-021 | QA | HTTP 200, alert "NIP / Username atau Kata Sandi tidak valid!" | PASS | exec 021 |
| 00.27 WIB | TC-API-022 | QA | **HTTP 200 (form login ulang)**, bukan 400/422 | **FAIL** (1/2) | exec 022 |
| 00.27 WIB | TC-API-023 | QA | **HTTP 500, body kosong (0 byte)** | **FAIL** (3/3) | exec 023 |
| 00.27 WIB | TC-API-024 | QA | HTTP 200, form login tampil | PASS | exec 024 |
| 00.27 WIB | TC-API-025 | QA | **HTTP 200, panel "YANLIK ADMIN" terbuka** | **FAIL** (2/2) | exec 025 |
| 00.27 WIB | TC-API-026 | QA | **HTTP 200, form `simpan_karyawan` terbuka** | **FAIL** (2/2) | exec 026 |
| 00.27 WIB | TC-API-027 | QA | **HTTP 200, modul data pegawai terbuka** | **FAIL** (1/2) | exec 027 |
| 00.27 WIB | TC-API-028 | QA | **HTTP 200, "Laporan Survey Bulanan" terbuka** | **FAIL** (2/2) | exec 028 |
| 00.27 WIB | TC-API-029 | QA | HTTP 200, field survei lengkap, 322 ms | PASS | exec 029 |
| 00.27 WIB | TC-API-030 | QA | **HTTP 200, halaman yang sama tanpa pesan validasi** | **FAIL** (1/3) | exec 030 |
| 00.27 WIB | TC-API-031 | QA | HTTP 404 | PASS | exec 031 |
| 00.27 WIB | TC-API-032 | QA | **HTTP 200, body kosong** | **FAIL** (2/2) | exec 032 |
| 00.27 WIB | TC-API-033 | QA | HTTP 301, `Location: https://...` | PASS | exec 033 |
| 00.27 WIB | TC-API-034 | QA | HSTS ada; **XCTO, CSP, XFO tidak ada** | **FAIL** (3/5) | exec 034 |
| 00.27 WIB | TC-API-035 | QA | HTTP 200, `no-store` dan `Pragma no-cache` ada | PASS | exec 035 |
| 00.27 WIB | TC-API-036 | QA | HTTP 200, 315 ms | PASS | exec 036 |
| 00.27 WIB | TC-API-037 | QA | HTTP 200, 334 ms | PASS | exec 037 |
| 00.27 WIB | TC-API-038 | QA | **HTTP 200 tanpa header `Allow`** | **FAIL** (1/2) | exec 038 |

PASS: hasil aktual sesuai expected result. FAIL: hasil aktual tidak sesuai. Tidak ada test case berstatus BLOCKED; dua area dinyatakan **di luar cakupan** (lihat Bagian 2.3 dan Lampiran D) karena berisiko mengubah data produksi dan tidak tersedianya akun uji.

---

## 11. Ringkasan Hasil Pengujian

### 11.1 Angka utama

| Informasi | Hasil |
|---|---|
| Total test case | 38 |
| Total request dieksekusi | 38 |
| Total assertion | 106 |
| PASS (test case) | 26 |
| FAIL (test case) | 12 |
| Assertion PASS | 86 |
| Assertion FAIL | 20 |
| Tingkat kelulusan test case | 68,4% |
| Tingkat kelulusan assertion | 81,1% |
| Durasi eksekusi | 13,4 detik |
| Rata-rata waktu respons | 263 ms |
| Median (p50) / p90 / p95 | 242 ms / 362 ms / 418 ms |
| Minimum / maksimum | 110 ms / 539 ms |
| Exit code Newman | 1 (terdapat kegagalan assertion) |

### 11.2 Rekap per test set

| Test set | Test case | PASS | FAIL | Assertion | Assertion FAIL |
|---|---|---|---|---|---|
| TS-API-01 Portal & Routing | 6 | 6 | 0 | 20 | 0 |
| TS-API-02 Login & Sesi | 5 | 5 | 0 | 13 | 0 |
| TS-API-03 Endpoint AJAX | 9 | 7 | 2 | 28 | 2 |
| TS-API-04 Autentikasi Negatif | 4 | 2 | 2 | 11 | 4 |
| TS-API-05 Kontrol Akses Admin | 4 | 0 | 4 | 8 | 7 |
| TS-API-06 Form Survei & Proses | 4 | 2 | 2 | 10 | 3 |
| TS-API-07 Header & Transport | 3 | 2 | 1 | 10 | 3 |
| TS-API-08 Kinerja Respons | 3 | 2 | 1 | 6 | 1 |
| **Total** | **38** | **26** | **12** | **106** | **20** |

### 11.3 Kesimpulan hasil

Aspek **fungsional dasar** (routing, portal, form login, struktur JSON, penanganan hasil kosong, 404, redirect sesi, HTTPS, dan waktu respons) berjalan sesuai harapan. Aspek **keamanan dan penanganan galat** belum memenuhi kriteria: panel admin terbuka tanpa autentikasi, endpoint pencarian membocorkan nama dan NIP, login admin menghasilkan 500, validasi server tidak memberikan umpan balik, serta header proteksi dan atribut cookie belum lengkap. Karena itu fitur **belum memenuhi kriteria penerimaan untuk produksi** dan memerlukan perbaikan sebelum dinyatakan lulus.

---

## 12. Analisis dan Temuan (Defect)

### D-01 — Panel admin survei dapat diakses tanpa autentikasi (Kritis)

- **Bukti:** TC-API-025…028; `GET /yanlik/admin.php`, `?page=karyawan`, `?page=pegawai`, `?page=survey` semuanya **HTTP 200** tanpa sesi. Halaman memuat menu "YANLIK ADMIN", form `simpan_karyawan`, modul data pegawai, dan "Laporan Survey Bulanan".
- **Dampak:** siapa pun dapat melihat struktur data, berpotensi mengubah data petugas, dan membaca laporan responden. Melanggar prinsip *least privilege* dan *confidentiality*.
- **Kaitan standar:** ISO/IEC 25010:2023 *security – confidentiality/integrity*; ISO/IEC 27001:2022 pengendalian akses (A.5.15, A.8.3).
- **Rekomendasi:** wajibkan sesi admin pada `admin.php` dan seluruh `page=`, pindahkan file admin ke luar webroot atau lindungi `.htaccess`, tambahkan CSRF token pada form, dan terapkan pemeriksaan peran di server.

### D-02 — Endpoint publik membocorkan nama dan NIP serta dapat dienumerasi (Tinggi)

- **Bukti:** TC-API-012/015; `GET /yanlik/get_pegawai.php?q=an` mengembalikan array `nama_pegawai` + `nip` lengkap tanpa autentikasi. Kata kunci satu karakter (`q=a`) tetap dilayani dan mengembalikan banyak pegawai.
- **Dampak:** kebocoran data pribadi (nama + NIP) dan enumerasi massal. Berisiko terhadap UU PDP dan ISO/IEC 27001:2022.
- **Rekomendasi:** batasi endpoint pada sesi/klien sah, terapkan minimal 3 karakter di server, batasi jumlah hasil (mis. `LIMIT 10`), masker NIP (hanya 4 digit terakhir), tambahkan *rate limiting*, dan pertimbangkan mengganti NIP dengan token internal.

### D-03 — Login admin menghasilkan HTTP 500 dan body kosong (Tinggi)

- **Bukti:** TC-API-023; `POST /login.php` dengan kredensial salah → **500 Internal Server Error, 0 byte**, konsisten pada dua percobaan. Respons tidak memberi pesan galat.
- **Dampak:** pengguna tidak mendapat umpan balik, error tak tertangani, dan log server berpotensi penuh. Melanggar *functional suitability* dan *reliability*.
- **Rekomendasi:** tangani kondisi kredensial salah secara eksplisit (HTTP 200 dengan pesan atau 401), bungkus akses basis data dengan *exception handling*, dan nonaktifkan `display_errors` di produksi.

### D-04 — Validasi sisi server form survei tidak ada (Sedang)

- **Bukti:** TC-API-030; `POST /yanlik/` hanya dengan `simpan=1` mengembalikan halaman yang sama (HTTP 200) tanpa pesan validasi dan tanpa konfirmasi. Validasi hanya ada di atribut HTML `required`.
- **Dampak:** pengguna dapat mengirim data tidak lengkap tanpa tahu kegagalan; berisiko menyimpan data cacat atau kehilangan penilaian.
- **Rekomendasi:** validasi wajib di server (nama, NIP, petugas, kepuasan), kembalikan 422/200 dengan pesan per field, dan gunakan token anti-CSRF.

### D-05 — Semantik kontrak HTTP dan penanganan galat belum konsisten (Sedang)

- **Bukti:**
  - TC-API-014: `get_pegawai.php` tanpa `q` → 200 `[]` (seharusnya 400).
  - TC-API-019: `POST` ke endpoint baca → 200 `[]` (seharusnya 405).
  - TC-API-032: `GET /yanlik/proses.php` → 200 dengan body kosong.
  - TC-API-038: `OPTIONS` tidak mengembalikan header `Allow`.
  - TC-API-022: login SSO tanpa kredensial → 200, bukan 4xx.
- **Dampak:** klien tidak dapat membedakan "tidak ditemukan" dan "permintaan salah"; menyulitkan integrasi dan monitoring.
- **Rekomendasi:** terapkan status yang tepat (400/405/422), kembalikan body JSON galat yang konsisten, dan sediakan header `Allow` pada OPTIONS.

### D-06 — Header proteksi respons belum lengkap (Sedang)

- **Bukti:** TC-API-034; HSTS ada (`max-age=63072000; includeSubDomains; preload`) dan pemaksaan HTTPS berjalan (TC-API-033), tetapi `X-Content-Type-Options`, `Content-Security-Policy`, dan `X-Frame-Options` tidak ada.
- **Dampak:** risiko MIME sniffing, clickjacking, dan eksekusi skrip pihak ketiga.
- **Rekomendasi:** tambahkan `X-Content-Type-Options: nosniff`, `Content-Security-Policy` yang ketat, `X-Frame-Options: DENY`/`frame-ancestors`, dan `Referrer-Policy`.

### D-07 — Cookie sesi tanpa HttpOnly, Secure, dan SameSite (Tinggi)

- **Bukti:** verifikasi manual `curl -D -` pada `/sso/index.php` dan `/sso/login.php`:
  `Set-Cookie: PHPSESSID=...; expires=...; Max-Age=86400; path=/` — tidak ada `HttpOnly`, `Secure`, maupun `SameSite`.
  Diperiksa manual via `curl -D -` karena Newman tidak mengekspos `Set-Cookie` pada `pm.response.headers`; bukti di Lampiran C.
- **Dampak:** cookie dapat dibaca JavaScript (XSS) dan dikirim pada permintaan lintas situs (CSRF); sesi berpotensi dicuri.
- **Rekomendasi:** set `session.cookie_httponly=1`, `session.cookie_secure=1`, `session.cookie_samesite=Lax/Strict`, dan regenerasi ID sesi setelah login.

### D-08 — Kredensial kosong tidak ditolak dengan 4xx (Rendah)

- **Bukti:** TC-API-022; `POST /sso/login.php` tanpa body → 200 halaman login.
- **Dampak:** rendah (tidak membocorkan data), tetapi menyulitkan otomatisasi dan observabilitas.
- **Rekomendasi:** kembalikan 400/422 dengan pesan validasi.

### 12.1 Hal positif yang terverifikasi

1. Pemaksaan HTTPS berfungsi (301 dari HTTP) dan HSTS aktif dengan `preload`.
2. Halaman portal dan login mengirim `Cache-Control: no-store` dan `Pragma: no-cache` (TC-API-035).
3. Redirect proteksi sesi SSO berjalan: `/sso/dashboard.php` dan `/sso/logout.php` → 302 ke `login.php`.
4. Endpoint JSON konsisten mengembalikan `application/json` dan array valid, termasuk untuk hasil kosong.
5. Uji permukaan SQL injection (`' OR '1'='1`) dan XSS (`<script>`) tidak berhasil memantulkan data atau skrip.
6. Kinerja respons baik: rata-rata 263 ms, p95 408 ms, seluruh request di bawah ambang 2–3 detik.

### 12.2 Prioritas perbaikan

| Prioritas | Temuan | Alasan |
|---|---|---|
| P0 | D-01, D-02, D-07 | Akses tidak sah dan kebocoran data pribadi |
| P1 | D-03, D-04 | Kegagalan fungsional dan integritas data |
| P2 | D-05, D-06 | Kontrak API dan pertahanan berlapis |
| P3 | D-08 | Konsistensi validasi |

---

## 13. Pemetaan ke Standar ISO (≥ 2022)

### 13.1 Kutipan landasan

> "Kualitas produk perangkat lunak dapat dievaluasi berdasarkan karakteristik seperti kesesuaian fungsional (*functional suitability*), efisiensi kinerja (*performance efficiency*), dan keamanan (*security*) guna memastikan sistem memenuhi kebutuhan pengguna" (ISO/IEC, 2023).

> "Pengujian perangkat lunak berperan memberikan informasi objektif mengenai kualitas objek uji serta risiko yang tersisa sebelum sistem digunakan secara operasional" (ISO/IEC/IEEE, 2022).

> "Panduan penyusunan spesifikasi pengujian berbasis kata kunci (*keyword-driven*) agar skenario uji terstruktur, modular, dan mudah diotomatisasi" (ISO/IEC/IEEE, 2024).

> "Menjadi landasan etika dan keamanan pengujian, terutama saat menggunakan data uji aplikasi bisnis skala kecil-menengah (tidak mengekspos kredensial asli, *API key*, atau data pribadi pelanggan ke dalam *repository* publik GitHub maupun file *environment* Postman)" (ISO/IEC, 2022).

> "Pengujian API dapat dilakukan untuk memverifikasi bahwa autentikasi dan otorisasi bekerja dengan benar, serta memastikan bahwa data sensitif tidak terekspos kepada pihak yang tidak berwenang" (Fauzi, t.t., hlm. 346).

Catatan edisi: template dokumentasi yang disediakan merujuk ISO/IEC/IEEE 29119-5:**2016**, sedangkan laporan ini memakai edisi **2024** sesuai `referensi_iso_qa_testing_2022.md` (standar terbit ≥ 2022). Struktur TD1–TD6 dan klausul 6.6 tetap sama; yang berubah adalah tahun edisi.

### 13.2 Tabel pemetaan

| Standar | Klausul/fokus | Penerapan pada pengujian ini | Bukti |
|---|---|---|---|
| **ISO/IEC 25010:2023** | *Functional suitability* | Kesesuaian status code dan struktur respons terhadap kontrak tiap endpoint | TC-API-001…020, 029, 031 |
| **ISO/IEC 25010:2023** | *Performance efficiency — time behaviour* | Ambang 3000 ms halaman dan 2000 ms API; statistik p50/p90/p95 | TC-API-036, 037; Bagian 11.1 |
| **ISO/IEC 25010:2023** | *Security — confidentiality, integrity, authentication* | Uji akses admin tanpa sesi, kebocoran NIP, injeksi, header, cookie | TS-API-04, 05, 07; D-01, D-02, D-07 |
| **ISO/IEC 25010:2023** | *Reliability* | Penanganan galat 500 pada login dan respons kosong | TC-API-023, 032; D-03, D-05 |
| **ISO/IEC/IEEE 29119-1:2022** | Konsep & kosakata (*test item*, *test condition*, *test case*, *expected/actual result*) | Istilah dan struktur laporan | Bagian 1–11 |
| **ISO/IEC/IEEE 29119-1:2022** | Prinsip pengujian berbasis risiko | Prioritas P0–P3 dan pemilihan area berisiko | Bagian 12.2 |
| **ISO/IEC/IEEE 29119-5:2024** | Klausul 6.6, TD4–TD6 (KDT) | Keyword `VERIFIKASI_*`, 38 test case, 8 test set, 3 prosedur | Bagian 7–9 |
| **ISO/IEC/IEEE 29119-5:2024** | Modularitas dan reusability | Keyword dan data dipisahkan; data dummy terpusat di environment | `env.postman_environment.json` |
| **ISO/IEC 27001:2022** | Pengendalian akses & perlindungan data | Tidak memakai kredensial asli; body respons dan cookie dihapus dari evidence; NIP disamarkan | `scripts/sanitize_newman_evidence.js`; Lampiran C |
| **ISO/IEC 27001:2022** | Keamanan informasi dalam siklus uji | Pengujian tidak mengubah/menghapus data produksi; hanya GET dan POST negatif | Bagian 2.3, Lampiran D |

### 13.3 Kesesuaian dokumentasi dengan ISO/IEC/IEEE 29119-5

| Elemen template | Status pada dokumen ini |
|---|---|
| Identitas dokumen | Terisi (Bagian 1) |
| Tujuan dan acuan standar | Terisi (Bagian 2.1–2.2) |
| Informasi sistem yang diuji | Terisi (Bagian 2.3) |
| Urutan TD1–TD6 | Terisi (Bagian 3) |
| TD1 fitur | Terisi (Bagian 4) |
| TD2 kondisi | Terisi (Bagian 5) |
| TD3 cakupan | Terisi (Bagian 6) |
| TD4 prasyarat, data, keyword, test case | Terisi (Bagian 7) |
| TD5 test set | Terisi (Bagian 8) |
| TD6 prosedur | Terisi (Bagian 9) |
| Catatan pelaksanaan | Terisi (Bagian 10) |
| Ringkasan hasil | Terisi (Bagian 11) |
| Pemeriksaan dan persetujuan | Tersedia, menunggu tanda tangan (Bagian 14) |
| Referensi | Terisi (Bagian 15) |

---

## 14. Pemeriksaan dan Persetujuan Dokumen

| Peran | Nama | Tanggal | Tanda tangan/paraf |
|---|---|---|---|
| Disusun oleh | [Nama penyusun] | [Tanggal] | |
| Diperiksa oleh | [Nama pemeriksa] | [Tanggal] | |
| Disetujui oleh | [Nama penyetuju] | [Tanggal] | |

---

## 15. Referensi

Fauzi, A. (t.t.). *Testing dan QA perangkat lunak: Pertemuan 12 — Pengujian API (API Testing)* [Materi e-learning]. Program Studi Teknik Informatika.

International Organization for Standardization. (2022). *Information security, cybersecurity and privacy protection — Information security management systems — Requirements* (ISO/IEC Standard No. 27001:2022).

International Organization for Standardization. (2023). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model* (ISO/IEC Standard No. 25010:2023).

ISO/IEC/IEEE. (2022). *Software and systems engineering — Software testing — Part 1: Concepts and definitions* (ISO/IEC/IEEE Standard No. 29119-1:2022).

ISO/IEC/IEEE. (2024). *Software and systems engineering — Software testing — Part 5: Keyword-Driven Testing* (ISO/IEC/IEEE Standard No. 29119-5:2024).

Postman. (2024). *Postman documentation: Writing tests*. https://learning.postman.com/docs/writing-scripts/script-references/test-examples/

Postman. (2024). *Newman: Run collections from the command line*. https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/

---

## 16. Lampiran

### Lampiran A — Struktur artefak

```
projek akhir/
├── postman/
│   ├── balaipensi_api_qa.postman_collection.json   # 8 folder, 38 request
│   └── env.postman_environment.json                # variabel + data dummy
├── evidence/
│   ├── newman_result.json                          # hasil run (sudah disanitasi)
│   └── newman_cli.txt                              # keluaran CLI lengkap
├── docs/
│   ├── LAPORAN_QA_API.md                           # dokumen ini (sumber)
│   └── LAPORAN_QA_API.pdf                          # versi cetak untuk pengumpulan
├── scripts/
│   ├── sanitize_newman_evidence.js                 # penghapus PII/cookie
│   └── build_laporan_pdf.js                        # Markdown → PDF (A4)
├── .gitignore
├── referensi_iso_qa_testing_2022.md
├── Pertemuan 12- Pengujian API (API Testing) (1).pdf
└── Template_Dokumentasi_ISO_29119-5_Keyword_Driven_Testing.docx
```

### Lampiran B — Cara menjalankan ulang

```bash
# 1. Prasyarat: Node.js dan Newman
npm install -g newman

# 2. Eksekusi koleksi
newman run postman/balaipensi_api_qa.postman_collection.json \
  -e postman/env.postman_environment.json \
  -r cli,json --reporter-json-export evidence/newman_result.json

# 3. Sanitasi evidence sebelum commit
node scripts/sanitize_newman_evidence.js

# 4. Bangun ulang PDF laporan (opsional; butuh Microsoft Edge terpasang)
node scripts/build_laporan_pdf.js
```

Catatan: pada mesin pengujian, biner Newman berada di `%APPDATA%\npm` sehingga PATH perlu ditambahkan lebih dahulu; perintah `newman run ...` tetap sama.

### Lampiran C — Etika, keamanan, dan sanitasi bukti

1. **Tanpa kredensial asli.** Seluruh data login pada koleksi dan environment bersifat sintetis (`qa_dummy_user_2026` / `QaDummy#2026!`). Tidak ada akun, token, atau API key nyata yang disimpan.
2. **Tanpa PII pada repository.** Reporter JSON Newman menyimpan body respons; karena `get_pegawai.php` mengembalikan nama dan NIP, body tersebut dihapus dan pola 16–18 digit disamarkan. Cookie `PHPSESSID` dan header `Set-Cookie` juga dihapus. Script sanitasi memverifikasi ulang dan menolak keluaran yang masih mengandung pola NIP.
3. **Tanpa perubahan data produksi.** Tidak ada pengiriman survei valid, tidak ada POST `simpan_karyawan`, dan tidak ada operasi hapus. POST hanya digunakan untuk skenario negatif yang tidak menyimpan data.
4. **Verifikasi manual cookie.** Postman/Newman menyembunyikan `Set-Cookie` dari `pm.response.headers`, sehingga atribut cookie diperiksa dengan `curl -sS -o /dev/null -D -`; temuan D-07 berasal dari pemeriksaan ini.
5. **Batas pengujian keamanan.** Uji injeksi dan XSS bersifat uji permukaan (satu payload), bukan audit penetrasi menyeluruh.

### Lampiran D — Keterbatasan pengujian

1. **Tanpa akun uji resmi**, sehingga alur login berhasil, otorisasi per peran, dan sesi terautentikasi tidak dapat diuji; hanya perilaku negatif dan tanpa sesi yang tercakup.
2. **Kinerja** diukur dari satu klien secara sekuensial; bukan uji beban konkuren dan tidak mewakili kapasitas produksi.
3. **Aksi admin yang mengubah data** tidak dijalankan, sehingga proteksi POST admin belum dapat disimpulkan — hanya akses GET yang terbukti terbuka.
4. **Konten dinamis** (jumlah pegawai, hasil survei) dapat berubah sewaktu-waktu sehingga nilai string tertentu dapat berbeda pada eksekusi berikutnya; assertion dirancang pada struktur, bukan pada nilai PII.
5. **Lingkungan** eksternal pihak ketiga (hosting, jaringan) dapat memengaruhi waktu respons.
