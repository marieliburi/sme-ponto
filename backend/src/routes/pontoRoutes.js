const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de ponto exigem autenticação do estagiário
router.use(authMiddleware);

// POST: Registrar batida de ponto com validação biométrica e GPS
router.post('/registrar', pontoController.registrarPonto);

// GET: Consultar batidas e contador ativo de hoje
router.get('/hoje', pontoController.getPontosHoje);

// GET: Espelho mensal de ponto (horas, saldo e ocorrências)
router.get('/mes', pontoController.getEspelhoMes);

// GET: Exportar relatório em PDF
router.get('/relatorio-pdf', pontoController.exportarRelatorioPdf);

module.exports = router;
