const { Pool } = require('pg');

// Membuat koneksi (pool) ke database PostgreSQL
const pool = new Pool({
    user: 'postgres',           // Username default dari PostgreSQL
    host: 'localhost',          // Menandakan database berjalan di komputer lokal
    database: 'bank_sampah_db', // Nama database yang sudah Anda buat di pgAdmin
    password: '12345678', // PENTING: Ganti teks ini dengan password asli Anda!
    port: 5432,                 // Port default PostgreSQL
});

// Mengekspor konfigurasi pool agar bisa dipanggil oleh index.js
module.exports = pool;