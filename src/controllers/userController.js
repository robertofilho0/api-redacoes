const bcrypt = require('bcryptjs');
const { User } = require('../models');

exports.listarAlunos = async (req, res) => {
  try {
    const alunos = await User.findAll({
      where: { papel: 'aluno' },
      attributes: ['id', 'nome', 'matricula', 'serie']
    });
    res.json(alunos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
};

exports.criarUsuario = async (req, res) => {
  const { nome, email, matricula, senha, perfil, serie } = req.body;

  try {
    if (!nome || !matricula || !senha || !perfil || !serie) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const existente = await User.findOne({ where: { matricula } });
    if (existente) return res.status(400).json({ error: 'Matrícula já cadastrada' });

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await User.create({
      nome,
      email: perfil === 'professora' ? email : null,
      matricula,
      senha: senhaHash,
      papel: perfil,
      serie
    });

    res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      matricula: novoUsuario.matricula,
      serie: novoUsuario.serie
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};
