const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

const app = express();
const SECRET_KEY = 'rahasia_bank_sampah_2026';

// =========================================================================
// MIDDLEWARE SECURITY & KONFIGURASI UMUM[cite: 34, 36]
// =========================================================================
app.use(helmet()); // Mengamankan header HTTP yang berisi informasi sensitif[cite: 36]
app.use(cors()); // Mengizinkan web domain tertentu untuk mengakses resource dari server[cite: 28]
app.use(express.json()); // Parsing body request menjadi JSON
app.use(xss()); // Mencegah user memasukkan script/HTML berbahaya ke dalam input (XSS)[cite: 36]

// =========================================================================
// OTENTIKASI (JWT)[cite: 24, 25]
// =========================================================================

// Endpoint Login
app.post('/api/login', async (req, res) => {
    const { no_hp } = req.body;
    try {
        // DML: Membaca data user dari tabel[cite: 70]
        const user = await pool.query('SELECT * FROM users WHERE no_hp = $1', [no_hp]);

        if (user.rows.length === 0) {
            // 401 Unauthorized: Perlu login / tidak berizin[cite: 52]
            return res.status(401).json({ error: 'Nomor HP tidak terdaftar' });
        }

        // Membuat Token JWT berisikan payload data[cite: 25]
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // 200 OK: Request berhasil[cite: 52]
        res.status(200).json({ message: 'Login berhasil', token });
    } catch (err) {
        // 500 Internal Server Error[cite: 52]
        res.status(500).json({ error: err.message });
    }
});

// Middleware untuk memverifikasi JWT pada endpoint yang diproteksi[cite: 34]
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Membaca header authorization[cite: 58]
    if (!authHeader) return res.status(403).json({ error: 'Akses ditolak. Token tidak tersedia.' }); // 403 Forbidden[cite: 52]

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' }); // 401 Unauthorized[cite: 52]
        req.user = decoded; // Menyimpan data payload ke req.user
        next(); // Melanjutkan operasi ke fungsi middleware/endpoint selanjutnya[cite: 34]
    });
};

// =========================================================================
// ENDPOINT TRANSAKSI (REST API)[cite: 52]
// =========================================================================

// 1. GET: Mengambil daftar transaksi (Dibatasi Pagination)[cite: 49, 52]
app.get('/api/transaksi', verifyToken, async (req, res) => {
    // Menentukan page dan limit, default page 1, limit 10[cite: 50]
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Menghitung Offset: (page - 1) * limit[cite: 50]
    const offset = (page - 1) * limit;

    try {
        // Aggregation: Menghitung total jumlah baris transaksi[cite: 72, 73]
        const countResult = await pool.query('SELECT COUNT(*) FROM transaksi');
        const totalData = parseInt(countResult.rows[0].count);

        // Total Page: jumlah keseluruhan data dibagi limit (dibulatkan ke atas)[cite: 50]
        const totalPage = Math.ceil(totalData / limit);

        // DML: Mengambil data dengan batasan LIMIT dan OFFSET[cite: 70]
        const transaksi = await pool.query(
            `SELECT t.id, u.nama, j.nama_sampah, t.berat_kg, t.total_harga, t.tanggal 
             FROM transaksi t 
             JOIN users u ON t.user_id = u.id 
             JOIN jenis_sampah j ON t.jenis_sampah_id = j.id 
             ORDER BY t.tanggal DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        // Format Response JSON pagination[cite: 50]
        res.status(200).json({
            totalData,
            totalPage,
            currentPage: page,
            data: transaksi.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST: Mengirimkan data transaksi baru[cite: 52]
// 2. POST: Mengirimkan data transaksi baru (Diperbarui dengan foto_bukti)
app.post('/api/transaksi', verifyToken, async (req, res) => {
    // Menambahkan foto_bukti dari request body
    const { user_id, jenis_sampah_id, berat_kg, foto_bukti } = req.body; 
    
    try {
        const jenisSampah = await pool.query('SELECT harga_per_kg FROM jenis_sampah WHERE id = $1', [jenis_sampah_id]);
        if (jenisSampah.rows.length === 0) return res.status(404).json({ error: 'Jenis sampah tidak ditemukan' });

        const harga_per_kg = jenisSampah.rows[0].harga_per_kg;
        const total_harga = berat_kg * harga_per_kg;

        // DML: INSERT data baru beserta foto_bukti ke dalam tabel
        const newTransaksi = await pool.query(
            'INSERT INTO transaksi (user_id, jenis_sampah_id, berat_kg, total_harga, foto_bukti) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, jenis_sampah_id, berat_kg, total_harga, foto_bukti]
        );

        // DML: UPDATE data saldo nasabah
        await pool.query('UPDATE users SET saldo = saldo + $1 WHERE id = $2', [total_harga, user_id]);

        res.status(201).json({ message: 'Setoran berhasil dicatat', data: newTransaksi.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. PUT: Mengganti/Koreksi data setoran[cite: 52]
app.put('/api/transaksi/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { berat_kg } = req.body;
    try {
        const checkTransaksi = await pool.query('SELECT * FROM transaksi WHERE id = $1', [id]);
        if (checkTransaksi.rows.length === 0) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

        const transaksiLama = checkTransaksi.rows[0];
        const jenisSampah = await pool.query('SELECT harga_per_kg FROM jenis_sampah WHERE id = $1', [transaksiLama.jenis_sampah_id]);

        const total_harga_baru = berat_kg * jenisSampah.rows[0].harga_per_kg;
        const selisih_harga = total_harga_baru - transaksiLama.total_harga;

        const updateTransaksi = await pool.query(
            'UPDATE transaksi SET berat_kg = $1, total_harga = $2 WHERE id = $3 RETURNING *',
            [berat_kg, total_harga_baru, id]
        );

        await pool.query('UPDATE users SET saldo = saldo + $1 WHERE id = $2', [selisih_harga, transaksiLama.user_id]);

        res.status(200).json({ message: 'Data setoran diperbarui', data: updateTransaksi.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE: Menghapus data transaksi[cite: 52]
app.delete('/api/transaksi/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const checkTransaksi = await pool.query('SELECT * FROM transaksi WHERE id = $1', [id]);
        if (checkTransaksi.rows.length === 0) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

        const transaksi = checkTransaksi.rows[0];

        // Kurangi saldo sebelum dihapus
        await pool.query('UPDATE users SET saldo = saldo - $1 WHERE id = $2', [transaksi.total_harga, transaksi.user_id]);

        // DML: Menghapus data dari tabel[cite: 70]
        await pool.query('DELETE FROM transaksi WHERE id = $1', [id]);

        res.status(200).json({ message: 'Transaksi berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const multer = require('multer');
const path = require('path');

// Mengizinkan folder 'uploads' diakses secara publik (Statis)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Konfigurasi Storage Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Mengarahkan file ke folder 'uploads' yang tadi dibuat
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Mengubah nama file agar unik dengan menambahkan timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter untuk memastikan hanya file gambar yang boleh diunggah
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // Maksimal 2MB

// =========================================================================
// ENDPOINT UPLOAD BUKTI TRANSAKSI
// =========================================================================

// Endpoint untuk mengunggah foto (Membutuhkan Token JWT)
app.post('/api/upload', verifyToken, upload.single('foto_bukti'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah' });
        }

        // Mengembalikan URL gambar yang bisa diakses oleh Front-End
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'Gambar berhasil diunggah',
            file_url: imageUrl
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// SERVER LISTEN
// =========================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});