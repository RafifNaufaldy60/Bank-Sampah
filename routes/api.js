const express = require('express');
const router = express.Router();


const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const authController = require('../controllers/authController');
const transaksiController = require('../controllers/transaksiController');


router.post('/login', authController.login);


router.get('/transaksi', verifyToken, transaksiController.getTransaksi);
router.get('/transaksi/:id', verifyToken, transaksiController.getTransaksiById);
router.post('/transaksi', verifyToken, transaksiController.createTransaksi);
router.put('/transaksi/:id', verifyToken, transaksiController.updateTransaksi);
router.delete('/transaksi/:id', verifyToken, transaksiController.deleteTransaksi);


router.post('/upload', verifyToken, upload.single('foto_bukti'), transaksiController.uploadFoto);

module.exports = router;