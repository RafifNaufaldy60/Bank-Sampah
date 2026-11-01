const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'rahasia_bank_sampah_2026';

exports.login = async (req, res) => {
    const { no_hp } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE no_hp = $1', [no_hp]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Nomor HP tidak terdaftar' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login berhasil', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};