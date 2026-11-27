#!/usr/bin/env node
/**
 * sanitize_newman_evidence.js
 * ---------------------------------------------------------------
 * Menghapus data pribadi (nama pegawai dan NIP) serta cookie sesi
 * dari berkas evidence/newman_result.json sebelum di-commit ke Git.
 *
 * Yang dipertahankan: status code, waktu respons, ukuran respons,
 * header non-sensitif, dan seluruh hasil assertion (PASS/FAIL).
 * Yang dihapus       : body respons (stream), cookie, dan header
 *                      Set-Cookie/Cookie, serta pola 16-18 digit (NIP).
 *
 * Pemakaian: node scripts/sanitize_newman_evidence.js
 */

const fs = require("fs");
const path = require("path");

const evidencePath = path.join(__dirname, "..", "evidence", "newman_result.json");
const raw = JSON.parse(fs.readFileSync(evidencePath, "utf8"));

const REDACTED_BODY = "[REDACTED] Body respons tidak disimpan: berpotensi memuat data pribadi (nama/NIP pegawai).";
const NIP_PATTERN = /\b\d{16,18}\b/g;

let redactedBodies = 0;
let redactedCookies = 0;
let redactedHeaders = 0;
let redactedDigits = 0;

function scrubString(value) {
  if (typeof value !== "string") return value;
  return value.replace(NIP_PATTERN, () => {
    redactedDigits += 1;
    return "[NIP-REDACTED]";
  });
}

function scrubDeep(value) {
  if (Array.isArray(value)) return value.map(scrubDeep);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) out[key] = scrubDeep(val);
    return out;
  }
  return scrubString(value);
}

const executions = raw.run.executions || [];
for (const execution of executions) {
  if (execution.response) {
    // Body respons tidak pernah disimpan ke repository.
    if (execution.response.stream) {
      redactedBodies += 1;
      execution.response.stream = null;
      execution.response.body = REDACTED_BODY;
    }
    // Cookie jar (berisi PHPSESSID) dikosongkan.
    if (Array.isArray(execution.response.cookie) && execution.response.cookie.length > 0) {
      redactedCookies += execution.response.cookie.length;
      execution.response.cookie = [];
    }
    // Header sensitif disamarkan.
    if (Array.isArray(execution.response.header)) {
      for (const header of execution.response.header) {
        const key = String(header.key || "").toLowerCase();
        if (key === "set-cookie" || key === "cookie" || key === "authorization") {
          header.value = "[REDACTED]";
          redactedHeaders += 1;
        }
      }
    }
  }

  // Header permintaan yang mungkin membawa kredensial.
  if (execution.request && Array.isArray(execution.request.header)) {
    for (const header of execution.request.header) {
      const key = String(header.key || "").toLowerCase();
      if (key === "cookie" || key === "authorization") {
        header.value = "[REDACTED]";
        redactedHeaders += 1;
      }
    }
  }
}

// Sapu seluruh teks tersisa (mis. kutipan error assertion) dari pola NIP.
const sanitized = scrubDeep(raw);
sanitized._sanitization = {
  tool: "scripts/sanitize_newman_evidence.js",
  reason: "Kepatuhan ISO/IEC 27001:2022 (perlindungan data pribadi) dan kebijakan repository publik.",
  redacted_response_bodies: redactedBodies,
  redacted_cookies: redactedCookies,
  redacted_headers: redactedHeaders,
  redacted_nip_like_strings: redactedDigits,
  note: "Hasil assertion, status code, waktu respons, dan ukuran respons tidak diubah."
};

const serialized = JSON.stringify(sanitized, null, 2);
fs.writeFileSync(evidencePath, serialized, "utf8");

// Verifikasi pasca-sanitasi.
const stillHasNip = /\b\d{16,18}\b/.test(serialized);
const stillHasPegawaiJson = /"nama_pegawai"\s*:/.test(serialized);
console.log("Sanitasi selesai:");
console.log("  body respons dihapus      :", redactedBodies);
console.log("  cookie dihapus            :", redactedCookies);
console.log("  header sensitif disamarkan:", redactedHeaders);
console.log("  string mirip NIP disamarkan:", redactedDigits);
console.log("  masih ada pola NIP 16-18 digit:", stillHasNip);
console.log("  masih ada JSON nama_pegawai   :", stillHasPegawaiJson);
if (stillHasNip || stillHasPegawaiJson) {
  console.error("PERINGATAN: sanitasi belum bersih. Periksa kembali sebelum commit.");
  process.exit(1);
}
