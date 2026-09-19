const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/biometric-login', authController.biometricLogin);

// Rotas protegidas (exigem JWT)
router.get('/me', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/recadastrar-biometria', authMiddleware, authController.recadastrarBiometria);

module.exports = router;
