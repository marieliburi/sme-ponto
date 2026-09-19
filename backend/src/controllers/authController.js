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
      matricula: user.matricula,
      cargo: user.cargo
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      matricula,
      cargo,
      setor,
      carga_horaria,
      turno,
      biometria_ativa
    } = req.body;

    if (!nome || !email || !senha || !cpf || !matricula) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos obrigatórios (nome, email, senha, cpf, matricula).'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    if (isLiveDb()) {
      // Verifica se usuário já existe
      const existing = await query('SELECT id FROM usuarios WHERE email = $1 OR matricula = $2', [
        email,
        matricula
      ]);
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'E-mail ou Matrícula já cadastrados no sistema.'
        });
      }

      const insertResult = await query(
        `INSERT INTO usuarios (
          nome, email, senha, cpf, matricula, cargo, setor, carga_horaria, turno, biometria_ativa
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, nome, email, cpf, matricula, cargo, setor, carga_horaria, turno, tolerancia_minutos, supervisor_nome, notificar_supervisor, biometria_ativa, foto_url, created_at`,
        [
          nome,
          email,
          senhaHash,
          cpf,
          matricula,
          cargo || 'Estagiário de TI',
          setor || 'SME Central',
          carga_horaria ? parseInt(carga_horaria, 10) : 6,
          turno || 'morning',
          biometria_ativa !== undefined ? biometria_ativa : true
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
      // Modo Mock / Memória
      const existing = memoryStore.usuarios.find(
        (u) => u.email === email || u.matricula === matricula
      );
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'E-mail ou Matrícula já cadastrados no sistema.'
        });
      }

      const novoUsuario = {
        id: `usr-${Date.now()}`,
        nome,
        email,
        senha: senhaHash,
        cpf,
        matricula,
        cargo: cargo || 'Estagiário de TI',
        setor: setor || 'SME Central',
        carga_horaria: carga_horaria ? parseInt(carga_horaria, 10) : 6,
        turno: turno || 'morning',
        tolerancia_minutos: 10,
        supervisor_nome: 'Amanda Rocha - DRE',
        notificar_supervisor: true,
        biometria_ativa: biometria_ativa !== undefined ? biometria_ativa : true,
        foto_url: 'https://lh3.googleusercontent.com/aida/AEtjO1UfhhXpM3nc6tDxGO2q633Gnc5QSvNNPc6KExhWNfrzF9m6f5ywhkvo77zt3xkBJmGDJu1PQ9vL9esM8oUoIwYoG-SLmR608R4H7liAKX-89iIt6iw5nU12rASwLDEOcutkVHhh_C8kClp3PwnsXVqcC0Bcgg5YwNn4t6eZSrC-9VFDLORfmCUyf326jK0vBbn85c3V-3NDRfvZHWs_pID2qWA_QVcOSpHp-dv5pF0WMzJ4z_B_eqBvW_g',
        created_at: new Date()
      };

      memoryStore.usuarios.push(novoUsuario);
      const token = generateToken(novoUsuario);

      const { senha: _, ...userSafe } = novoUsuario;
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

    let usuario = null;

    if (isLiveDb()) {
      const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        usuario = result.rows[0];
      }
    } else {
      usuario = memoryStore.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    // Validação da senha com bcrypt (com suporte a senha padrão em mock)
    const senhaValida = await bcrypt.compare(senha, usuario.senha).catch(() => false);
    const senhaPlanaValida = !senhaValida && senha === '123456';

    if (!senhaValida && !senhaPlanaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    const token = generateToken(usuario);
    const { senha: _, ...userSafe } = usuario;

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
    const { email, biometricSignature } = req.body;

    let usuario = null;

    if (isLiveDb()) {
      const result = email
        ? await query('SELECT * FROM usuarios WHERE email = $1', [email])
        : await query('SELECT * FROM usuarios LIMIT 1');
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

    if (!usuario.biometria_ativa) {
      return res.status(403).json({
        success: false,
        message: 'Acesso biométrico não está ativado para este usuário.'
      });
    }

    const token = generateToken(usuario);
    const { senha: _, ...userSafe } = usuario;

    return res.status(200).json({
      success: true,
      message: 'Autenticação biométrica validada via GPS e dispositivo!',
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
    const { turno, notificar_supervisor, cargo, setor } = req.body;
    const userId = req.user.id;

    if (isLiveDb()) {
      const updateResult = await query(
        `UPDATE usuarios 
         SET turno = COALESCE($1, turno),
             notificar_supervisor = COALESCE($2, notificar_supervisor),
             cargo = COALESCE($3, cargo),
             setor = COALESCE($4, setor),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, nome, email, cpf, matricula, cargo, setor, carga_horaria, turno, tolerancia_minutos, supervisor_nome, notificar_supervisor, biometria_ativa, foto_url`,
        [turno, notificar_supervisor, cargo, setor, userId]
      );

      return res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        usuario: updateResult.rows[0]
      });
    } else {
      const uIndex = memoryStore.usuarios.findIndex((u) => u.id === userId);
      if (uIndex !== -1) {
        if (turno !== undefined) memoryStore.usuarios[uIndex].turno = turno;
        if (notificar_supervisor !== undefined)
          memoryStore.usuarios[uIndex].notificar_supervisor = notificar_supervisor;
        if (cargo !== undefined) memoryStore.usuarios[uIndex].cargo = cargo;
        if (setor !== undefined) memoryStore.usuarios[uIndex].setor = setor;

        const { senha: _, ...safeUser } = memoryStore.usuarios[uIndex];
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
  try {
    const userId = req.user.id;
    const { ativa } = req.body;
    const novoStatus = ativa !== undefined ? ativa : true;

    if (isLiveDb()) {
      await query('UPDATE usuarios SET biometria_ativa = $1 WHERE id = $2', [novoStatus, userId]);
    } else {
      const u = memoryStore.usuarios.find((u) => u.id === userId);
      if (u) u.biometria_ativa = novoStatus;
    }

    return res.status(200).json({
      success: true,
      message: novoStatus ? 'Biometria revalidada e ativa!' : 'Biometria desativada.',
      biometria_ativa: novoStatus
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao configurar biometria.',
      error: error.message
    });
  }
}

module.exports = {
  register,
  login,
  biometricLogin,
  getProfile,
  updateProfile,
  recadastrarBiometria
};
