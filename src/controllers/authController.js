const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const SECRET = process.env.JWT_SECRET || 'secreta';

exports.loginAluno = async (req, res) => {
  const { matricula } = req.body;

  try {
    const user = await User.scope(null).findOne({ 
      where: { matricula, papel: 'aluno' }
    });

    if (!user) return res.status(404).json({ message: 'Aluno não encontrado' });

    const token = jwt.sign({
      id: user.id,
      papel: user.papel,
      nome: user.nome,
      matricula: user.matricula
    }, SECRET, { expiresIn: '1d' });

    res.json({
      token,
      aluno: {
        id: user.id,
        nome: user.nome,
        matricula: user.matricula,
        serie: user.serie
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao autenticar' });
  }
};

exports.loginProfessora = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.scope(null).findOne({ where: { email, papel: 'professora' } });

    if (!user) return res.status(404).json({ message: 'Usuária não encontrada' });

    const valid = await bcrypt.compare(senha, user.senha);
    if (!valid) return res.status(401).json({ message: 'Senha incorreta' });

    const token = jwt.sign({
      id: user.id,
      papel: user.papel,
      nome: user.nome
    }, SECRET, { expiresIn: '1d' });

    res.json({ token, professora: { id: user.id, nome: user.nome } });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao autenticar professora' });
  }
};
