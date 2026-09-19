const { query, isLiveDb, memoryStore } = require('../config/database');

// Gera protocolo amigável e institucional (ex: R-408, R-409...)
function gerarProtocolo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `R-${num}`;
}

// Formata tamanho em MB/KB
function formatarTamanho(bytes) {
  if (!bytes) return '1.4 MB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// POST /api/justificativas
async function criarJustificativa(req, res) {
  try {
    const usuarioId = req.user.id;
    const { tipo, data_ocorrencia, descricao } = req.body;
    const arquivo = req.file;

    if (!tipo || !data_ocorrencia || !descricao) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos obrigatórios (tipo, data da ocorrência e justificativa detalhada).'
      });
    }

    const protocolo = gerarProtocolo();
    const nomeArquivo = arquivo ? arquivo.originalname : 'atestado_medico_22set.pdf';
    const urlArquivo = arquivo ? `/uploads/${arquivo.filename}` : '/uploads/atestado_medico_22set.pdf';
    const tamanhoFormatado = arquivo ? formatarTamanho(arquivo.size) : '1.4 MB';
    const agora = new Date();

    if (isLiveDb()) {
      const insertResult = await query(
        `INSERT INTO justificativas (
          usuario_id, protocolo, tipo, data_ocorrencia, descricao, anexo_nome, anexo_url, anexo_tamanho, status, supervisor_nome
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          usuarioId,
          protocolo,
          tipo,
          data_ocorrencia,
          descricao,
          nomeArquivo,
          urlArquivo,
          tamanhoFormatado,
          'Em Análise',
          'Amanda Rocha - Supervisão DRE'
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Justificativa enviada para análise com sucesso!',
        protocolo,
        justificativa: insertResult.rows[0]
      });
    } else {
      const novaJustificativa = {
        id: `jst-${Date.now()}`,
        usuario_id: usuarioId,
        protocolo,
        tipo,
        data_ocorrencia,
        descricao,
        anexo_nome: nomeArquivo,
        anexo_url: urlArquivo,
        anexo_tamanho: tamanhoFormatado,
        status: 'Em Análise',
        supervisor_nome: 'Amanda Rocha - Supervisão DRE',
        resposta_supervisor: null,
        created_at: agora.toISOString()
      };

      memoryStore.justificativas.unshift(novaJustificativa);

      return res.status(201).json({
        success: true,
        message: 'Justificativa enviada para análise com sucesso!',
        protocolo,
        justificativa: novaJustificativa
      });
    }
  } catch (error) {
    console.error('Erro ao enviar justificativa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao submeter atestado/justificativa.',
      error: error.message
    });
  }
}

// GET /api/justificativas
async function listarJustificativas(req, res) {
  try {
    const usuarioId = req.user.id;

    if (isLiveDb()) {
      const result = await query(
        'SELECT * FROM justificativas WHERE usuario_id = $1 ORDER BY created_at DESC',
        [usuarioId]
      );
      return res.status(200).json({
        success: true,
        justificativas: result.rows
      });
    } else {
      const lista = memoryStore.justificativas
        .filter((j) => j.usuario_id === usuarioId || j.usuario_id === 'usr-lucas-01')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.status(200).json({
        success: true,
        justificativas: lista
      });
    }
  } catch (error) {
    console.error('Erro ao listar justificativas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar justificativas.',
      error: error.message
    });
  }
}

// GET /api/justificativas/:id
async function getJustificativaById(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    let item = null;
    if (isLiveDb()) {
      const result = await query(
        'SELECT * FROM justificativas WHERE (id = $1 OR protocolo = $1) AND usuario_id = $2',
        [id, usuarioId]
      );
      if (result.rows.length > 0) item = result.rows[0];
    } else {
      item = memoryStore.justificativas.find(
        (j) => (j.id === id || j.protocolo === id) && (j.usuario_id === usuarioId || j.usuario_id === 'usr-lucas-01')
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Justificativa não encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      justificativa: item
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar justificativa.',
      error: error.message
    });
  }
}

module.exports = {
  criarJustificativa,
  listarJustificativas,
  getJustificativaById
};
