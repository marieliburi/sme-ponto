const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, isLiveDb, memoryStore } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'sme_ponto_semente_secreta_jwt_2025_homologacao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      cargo: user.cargo
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Informe o e-mail e a senha.'
      });
    }

    const emailClean = email.trim().toLowerCase();
    let usuario = null;

    if (isLiveDb()) {
      const result = await query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [emailClean]);
      if (result.rows.length > 0) {
        usuario = result.rows[0];
      }
    } else {
      usuario = memoryStore.usuarios.find((u) => u.email.toLowerCase() === emailClean);
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    const hashBanco = usuario.senha_hash || usuario.senha || '';
    let senhaValida = await bcrypt.compare(senha, hashBanco).catch(() => false);

    if (!senhaValida && hashBanco === senha) {
      senhaValida = true;
    }

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    const token = generateToken(usuario);
    const { senha_hash: _, senha: __, ...userSafe } = usuario;

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      usuario: userSafe
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao realizar login.',
      error: error.message
    });
  }
}

// POST /api/ponto/registrar
async function registrarPonto(req, res) {
  try {
    // Tenta resgatar do token decodificado do middleware OU do corpo da requisição enviado pelo app
    const usuario_id = req.user?.id || req.body?.usuario_id;
    const { tipo, latitude, longitude } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ success: false, message: 'ID do usuário não fornecido.' });
    }

    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const dataPonto = `${ano}-${mes}-${dia}`;

    if (String(tipo).toUpperCase() === 'ENTRADA') {
      const queryInsert = `
        INSERT INTO registros_ponto 
          (usuario_id, data_ponto, horario_entrada, lat_entrada, long_entrada, status)
        VALUES 
          ($1, $2, $3, $4, $5, 'registrado')
        RETURNING *;
      `;
      const valuesInsert = [usuario_id, dataPonto, agora, latitude || 0, longitude || 0];
      const resultado = await query(queryInsert, valuesInsert);

      return res.status(201).json({
        success: true,
        message: 'Entrada registrada com sucesso!',
        registro: resultado.rows[0]
      });

    } else if (String(tipo).toUpperCase() === 'SAIDA') {
      const queryBusca = `
        SELECT * FROM registros_ponto 
        WHERE usuario_id = $1 AND data_ponto = $2 AND horario_saida IS NULL
        ORDER BY horario_entrada DESC
        LIMIT 1;
      `;
      const registroExistente = await query(queryBusca, [usuario_id, dataPonto]);

      if (registroExistente.rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nenhum registro de entrada aberto encontrado para hoje.' 
        });
      }

      const pontoAtual = registroExistente.rows[0];
      const entradaTime = new Date(pontoAtual.horario_entrada);
      const duracaoSegundos = Math.max(0, Math.floor((agora - entradaTime) / 1000));

      const queryUpdate = `
        UPDATE registros_ponto 
        SET 
          horario_saida = $1,
          lat_saida = $2,
          long_saida = $3,
          duracao_segundos = $4,
          status = 'concluido'
        WHERE id = $5
        RETURNING *;
      `;
      const valuesUpdate = [agora, latitude || 0, longitude || 0, duracaoSegundos, pontoAtual.id];
      const resultado = await query(queryUpdate, valuesUpdate);

      return res.status(200).json({
        success: true,
        message: 'Saída registrada com sucesso!',
        registro: resultado.rows[0]
      });
    }

    return res.status(400).json({ success: false, message: 'Tipo de ponto inválido.' });

  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao salvar no banco de dados.', 
      error: error.message 
    });
  }
}

module.exports = {
  login,
  registrarPonto
};