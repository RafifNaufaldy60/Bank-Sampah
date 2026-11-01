const pool = require('../config/db');

exports.getTransaksi = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const countResult = await pool.query('SELECT COUNT(*) FROM transaksi');
        const totalData = parseInt(countResult.rows[0].count);
        const totalPage = Math.ceil(totalData / limit);

        const transaksi = await pool.query(
            `SELECT t.id, u.nama, j.nama_sampah, t.berat_kg, t.total_harga, t.foto_bukti, t.tanggal 
             FROM transaksi t 
             JOIN users u ON t.user_id = u.id 
             JOIN jenis_sampah j ON t.jenis_sampah_id = j.id 
             ORDER BY t.tanggal DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.status(200).json({ totalData, totalPage, currentPage: page, data: transaksi.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTransaksi = async (req, res) => {
    const { user_id, jenis_sampah_id, berat_kg, foto_bukti } = req.body;
    try {
        const jenisSampah = await pool.query('SELECT harga_per_kg FROM jenis_sampah WHERE id = $1', [jenis_sampah_id]);
        if (jenisSampah.rows.length === 0) return res.status(404).json({ error: 'Jenis sampah tidak ditemukan' });

        const harga_per_kg = jenisSampah.rows[0].harga_per_kg;
        const total_harga = berat_kg * harga_per_kg;

        const newTransaksi = await pool.query(
            'INSERT INTO transaksi (user_id, jenis_sampah_id, berat_kg, total_harga, foto_bukti) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, jenis_sampah_id, berat_kg, total_harga, foto_bukti]
        );

        await pool.query('UPDATE users SET saldo = saldo + $1 WHERE id = $2', [total_harga, user_id]);
        res.status(201).json({ message: 'Setoran berhasil dicatat', data: newTransaksi.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTransaksi = async (req, res) => {
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
};

exports.deleteTransaksi = async (req, res) => {
    const { id } = req.params;
    try {
        const checkTransaksi = await pool.query('SELECT * FROM transaksi WHERE id = $1', [id]);
        if (checkTransaksi.rows.length === 0) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

        const transaksi = checkTransaksi.rows[0];
        await pool.query('UPDATE users SET saldo = saldo - $1 WHERE id = $2', [transaksi.total_harga, transaksi.user_id]);
        await pool.query('DELETE FROM transaksi WHERE id = $1', [id]);

        res.status(200).json({ message: 'Transaksi berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadFoto = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah' });
        }
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({ message: 'Gambar berhasil diunggah', file_url: imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};