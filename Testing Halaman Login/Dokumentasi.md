# Dokumentasi Pengujian Otomatis Fitur Login (Keyword-Driven Testing)

- **Tanggal Eksekusi:** 21 November 2026
- **Pendekatan Pengujian:** Black-Box Testing berbasis *Keyword-Driven Testing* (KDT)
- **Teknologi & Tools:** Python, Selenium WebDriver, Google Chrome, Browser DevTools
- **Status Pengujian:** 3/3 Skenario Utama **PASS**

---

## 1. Ringkasan Progres
Pengujian otomatis pada fitur **Login** aplikasi web dirancang dan dijalankan menggunakan pendekatan *Keyword-Driven Testing* (KDT) dengan Python dan Selenium WebDriver tanpa bergantung pada *source code* aplikasi. Identifikasi elemen antarmuka dilakukan melalui *Browser DevTools*, sementara struktur kode dipisahkan menjadi *keywords*, data uji, dan *runner* eksekusi agar mudah dipelihara serta dikembangkan ke fitur berikutnya.

Seluruh skenario uji utama (`TC-LOGIN-01` hingga `TC-LOGIN-03`) telah dieksekusi dan berhasil memperoleh status **PASS**.

---

## 2. Struktur Folder & Komponen
```text
Testing/
├── .gitignore       # Mengabaikan cache Python, environment lokal, & file sensitif
├── keywords.py      # Definisi keyword aksi UI & verifikasi (low-level & composite)
├── test_data.py     # Konfigurasi URL target, locator elemen, & skenario data uji
├── login_test.py    # Runner eksekusi skenario, pencatatan log, & manajemen WebDriver
└── README.md        # Dokumentasi pengujian & progres
```

- **`keywords.py`**: Menyediakan *keyword low-level* (`open_login_page`, `set_text`, `click`, `get_validation_message`, `verify_text`, `verify_url_contains`) dan *keyword composite* (`login_user`).
- **`test_data.py`**: Menyimpan konfigurasi URL halaman login, *locator* elemen, serta daftar skenario uji pada `LOGIN_TEST_CASES`.
- **`login_test.py`**: Menjalankan iterasi *test case*, mencetak status (`[PASS]`, `[FAIL]`, `[BLOCKED/ERROR]`) beserta *timestamp*, dan menutup sesi *browser* setelah selesai.
- **`.gitignore`**: Mencegah file sementara (`__pycache__/`, `.env`, *virtual environment*, dan file lokal lainnya) ikut terunggah ke repositori GitHub.

---

## 3. Identifikasi Elemen UI
Berdasarkan hasil inspeksi elemen pada halaman login aplikasi target:
- **Input Username:** `id="username"` (atribut `required`)
- **Input Password:** `id="password"` (atribut `required`)
- **Tombol Submit:** CSS Selector `form button[type='submit']`
- **Pesan Error Gagal Login:** CSS Selector `.form-section .alert` dengan teks `"NIP / Username atau Kata Sandi tidak valid!"`

---

## 4. Hasil Eksekusi Test Case
| ID Kasus Uji | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-LOGIN-01` | Field `username` dikosongkan saat submit (validasi HTML5 `required`) | Muncul pesan validasi bawaan browser bahwa field wajib diisi | Muncul pesan `'Please fill out this field.'` | **PASS** |
| `TC-LOGIN-02` | Input kredensial yang tidak valid | Muncul pesan error `"NIP / Username atau Kata Sandi tidak valid!"` | Pesan error tampil sesuai ekspektasi | **PASS** |
| `TC-LOGIN-03` | Input kredensial yang valid (autentikasi sukses) | Pengguna berhasil masuk dan diarahkan ke URL halaman tujuan | Berhasil masuk ke halaman tujuan sesuai URL | **PASS** |

---

## 5. Kendala & Penyelesaian
1. **Dependensi & Konflik Nama Modul:** Menginstal *library* `selenium` pada *environment* Python yang digunakan serta mengubah nama file dari `keyword.py` menjadi `keywords.py` agar tidak bentrok dengan modul bawaan Python (`keyword`).
2. **Ketidaksesuaian *Key* Data Uji:** Menyamakan pemanggilan *key* `"username"` pada skrip *runner* agar sesuai dengan struktur data pada `test_data.py`.
3. **Verifikasi URL Login Sukses (`TC-LOGIN-03`):** Menyesuaikan kredensial valid serta potongan URL tujuan setelah autentikasi berhasil sehingga pengecekan URL berjalan sesuai alur aplikasi.

---

## 6. Cara Menjalankan Pengujian
1. Pastikan `selenium` sudah terpasang:
   ```powershell
   pip install selenium
   ```
2. Atur variabel konfigurasi/uji pada sesi PowerShell lokal (hindari menaruh kredensial asli secara permanen di repositori):
   ```powershell
   $env:LOGIN_URL="URL_HALAMAN_LOGIN"
   $env:TEST_LOGIN_USERNAME="USERNAME_VALID"
   $env:TEST_LOGIN_PASSWORD="PASSWORD_VALID"
   $env:EXPECTED_LOGIN_URL="POTONGAN_URL_TUJUAN"
   ```
3. Jalankan skrip pengujian dari direktori project:
   ```powershell
   cd C:\laragon\www\Testing
   python -u "c:\laragon\www\Testing\login_test.py"
   ```

> 
---

## 7. Rencana Lanjutan
- Menambahkan skenario uji negatif tambahan (seperti *password* kosong atau input dengan spasi berlebih).
- Mengembangkan kerangka *Keyword-Driven Testing* ke modul atau fitur aplikasi berikutnya.