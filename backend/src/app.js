const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const pontoRoutes = require('./routes/pontoRoutes');
const anexoRoutes = require('./routes/anexoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de upload estaticamente
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Rota de Boas-Vindas e Health Check
app.get('/', (req, res) => {
  res.json({
    projeto: 'Sistema de Ponto SME - Secretaria Municipal de Educação',
    versao: '1.4.2',
    status: 'online',
    servicos: {
      auth: '/api/auth',
      ponto: '/api/ponto',
      justificativas: '/api/justificativas'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Registro de Rotas
app.use('/api/auth', authRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api', anexoRoutes);

// Tratamento de rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada no servidor SME Ponto.`
  });
});

// Middleware Global de Tratamento de Erros
app.use((err, req, res, next) => {
  console.error('[ERRO GLOBAL]:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Erro interno no servidor.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Inicialização do Servidor (se executado diretamente)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Servidor SME Ponto rodando na porta ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`📋 Documentação: http://localhost:${PORT}/`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
