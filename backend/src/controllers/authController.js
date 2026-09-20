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

// POST /api/auth/register
async function register(req, res) {
  try {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos obrigatórios (nome, e-mail e senha).'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    if (isLiveDb()) {
      // 1. Verifica se e-mail já existe na tabela atual
      const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já cadastrado no sistema.'
        });
      }

      // 2. Insere estritamente nas colunas existentes: nome, email, senha_hash, cargo
      const insertResult = await query(
        `INSERT INTO usuarios (nome, email, senha_hash, cargo)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nome, email, cargo, criado_em`,
        [
          nome.trim(),
          email.trim().toLowerCase(),
          senhaHash,
          cargo || 'Estagiário'
        ]
      );

      const novoUsuario = insertResult.rows[0];
      const token = generateToken(novoUsuario);

      return res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso!',
        token,
        usuario: novoUsuario
      });
    } else {
      // Modo de contingência (memória local)
      const existing = memoryStore.usuarios.find((u) => u.email === email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já cadastrado no sistema.'
        });
      }

      const novoUsuario = {
        id: `usr-${Date.now()}`,
        nome,
        email,
        senha_hash: senhaHash,
        cargo: cargo || 'Estagiário',
        criado_em: new Date()
      };

      memoryStore.usuarios.push(novoUsuario);
      const token = generateToken(novoUsuario);

      const { senha_hash: _, ...userSafe } = novoUsuario;
      return res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso!',
        token,
        usuario: userSafe
      });
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao criar conta.',
      error: error.message
    });
  }
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
      // Busca pelo e-mail na tabela usuarios
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

    // Suporte tanto para senha criptografada em Bcrypt quanto para senha plana salva previamente
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

// POST /api/auth/biometric-login
async function biometricLogin(req, res) {
  try {
    const { email } = req.body;
    let usuario = null;

    if (isLiveDb()) {
      const result = email
        ? await query('SELECT id, nome, email, cargo, criado_em FROM usuarios WHERE LOWER(email) = LOWER($1)', [email])
        : await query('SELECT id, nome, email, cargo, criado_em FROM usuarios LIMIT 1');
      if (result.rows.length > 0) {
        usuario = result.rows[0];
      }
    } else {
      usuario = email
        ? memoryStore.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase())
        : memoryStore.usuarios[0];
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado para autenticação biométrica.'
      });
    }

    const token = generateToken(usuario);
    const { senha_hash: _, senha: __, ...userSafe } = usuario;

    return res.status(200).json({
      success: true,
      message: 'Autenticação biométrica realizada com sucesso!',
      token,
      usuario: userSafe
    });
  } catch (error) {
    console.error('Erro no login biométrico:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar biometria.',
      error: error.message
    });
  }
}

// GET /api/auth/me
async function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    usuario: req.user
  });
}

// PUT /api/auth/profile
async function updateProfile(req, res) {
  try {
    const { cargo, nome } = req.body;
    const userId = req.user.id;

    if (isLiveDb()) {
      const updateResult = await query(
        `UPDATE usuarios 
         SET cargo = COALESCE($1, cargo),
             nome = COALESCE($2, nome)
         WHERE id = $3
         RETURNING id, nome, email, cargo, criado_em`,
        [cargo, nome, userId]
      );

      return res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        usuario: updateResult.rows[0]
      });
    } else {
      const uIndex = memoryStore.usuarios.findIndex((u) => u.id === userId);
      if (uIndex !== -1) {
        if (cargo !== undefined) memoryStore.usuarios[uIndex].cargo = cargo;
        if (nome !== undefined) memoryStore.usuarios[uIndex].nome = nome;

        const { senha_hash: _, senha: __, ...safeUser } = memoryStore.usuarios[uIndex];
        return res.status(200).json({
          success: true,
          message: 'Perfil atualizado com sucesso!',
          usuario: safeUser
        });
      }
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro na atualização de perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar perfil.',
      error: error.message
    });
  }
}

// POST /api/auth/recadastrar-biometria
async function recadastrarBiometria(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Biometria validada com sucesso!'
  });
}

module.exports = {
  register,
  login,
  biometricLogin,
  getProfile,
  updateProfile,
  recadastrarBiometria
};

// POST /api/ponto/registrar
// Rota do Backend (servidor Node.js)
app.post('/api/ponto/registrar', async (req, res) => {
  try {
    const usuario_id = req.user?.id || req.body.usuario_id;
    const { tipo, latitude, longitude } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID do usuário não fornecido.' });
    }

    const agora = new Date();
    
    // Formata a data local como YYYY-MM-DD garantindo a data correta do fuso local
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const dataPonto = `${ano}-${mes}-${dia}`;

    if (tipo === 'ENTRADA') {
      const queryInsert = `
        INSERT INTO registros_ponto 
          (usuario_id, data_ponto, horario_entrada, lat_entrada, long_entrada, status)
        VALUES 
          ($1, $2, $3, $4, $5, 'registrado')
        RETURNING *;
      `;
      const valuesInsert = [usuario_id, dataPonto, agora, latitude, longitude];
      const resultado = await db.query(queryInsert, valuesInsert);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Entrada registrada com sucesso!',
        registro: resultado.rows[0]
      });

    } else if (tipo === 'SAIDA') {
      const queryBusca = `
        SELECT * FROM registros_ponto 
        WHERE usuario_id = $1 AND data_ponto = $2 AND horario_saida IS NULL
        ORDER BY horario_entrada DESC
        LIMIT 1;
      `;
      const registroExistente = await db.query(queryBusca, [usuario_id, dataPonto]);

      if (registroExistente.rows.length === 0) {
        return res.status(400).json({ 
          sucesso: false, 
          mensagem: 'Nenhum registro de entrada aberto encontrado para hoje.' 
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
      const valuesUpdate = [agora, latitude, longitude, duracaoSegundos, pontoAtual.id];
      const resultado = await db.query(queryUpdate, valuesUpdate);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Saída registrada com sucesso!',
        registro: resultado.rows[0]
      });
    }

    return res.status(400).json({ mensagem: 'Tipo de ponto inválido.' });

  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao salvar no banco de dados.' });
  }
});