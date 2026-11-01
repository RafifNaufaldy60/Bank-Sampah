const express = require('express');
const router = express.Router();

// Import Middleware dan Controller
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const authController = require('../controllers/authController');
const transaksiController = require('../controllers/transaksiController');

// Route Otentikasi
router.post('/login', authController.login);

// Route Transaksi (Membutuhkan JWT: verifyToken)
router.get('/transaksi', verifyToken, transaksiController.getTransaksi);
router.post('/transaksi', verifyToken, transaksiController.createTransaksi);
router.put('/transaksi/:id', verifyToken, transaksiController.updateTransaksi);
router.delete('/transaksi/:id', verifyToken, transaksiController.deleteTransaksi);

// Route Upload Foto
router.post('/upload', verifyToken, upload.single('foto_bukti'), transaksiController.uploadFoto);

module.exports = router;