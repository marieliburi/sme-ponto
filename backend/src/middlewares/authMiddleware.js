const jwt = require('jsonwebtoken');
const { query, isLiveDb, memoryStore } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'sme_ponto_semente_secreta_jwt_2025_homologacao';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido ou formato inválido.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let usuario = null;

    if (isLiveDb()) {
      const result = await query(
        'SELECT id, nome, email, cpf, matricula, cargo, setor, carga_horaria, turno, tolerancia_minutos, supervisor_nome, notificar_supervisor, biometria_ativa, foto_url FROM usuarios WHERE id = $1',
        [decoded.id]
      );
      if (result && result.rows.length > 0) {
        usuario = result.rows[0];
      }
    } else {
      usuario = memoryStore.usuarios.find((u) => u.id === decoded.id || u.email === decoded.email);
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Sessão inválida ou usuário não encontrado.'
      });
    }

    // Adiciona o usuário logado à requisição
    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sessão expirada. Faça login novamente.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou não autorizado.'
    });
  }
}

module.exports = authMiddleware;
