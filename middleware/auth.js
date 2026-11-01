const jwt = require('jsonwebtoken');
const SECRET_KEY = 'rahasia_bank_sampah_2026';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Akses ditolak. Token tidak tersedia.' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token tidak valid' });
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;