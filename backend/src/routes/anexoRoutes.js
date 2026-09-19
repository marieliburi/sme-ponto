const express = require('express');
const router = express.Router();
const anexoController = require('../controllers/anexoController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Todas as rotas de anexo exigem autenticação do estagiário
router.use(authMiddleware);

// POST: Enviar justificativa com upload de arquivo (PDF/Imagem até 10MB)
router.post('/justificativas', upload.single('arquivo'), anexoController.criarJustificativa);

// GET: Listar justificativas enviadas pelo estagiário
router.get('/justificativas', anexoController.listarJustificativas);

// GET: Obter detalhes de uma justificativa por ID ou protocolo
router.get('/justificativas/:id', anexoController.getJustificativaById);

module.exports = router;
