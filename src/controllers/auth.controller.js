const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 4);

function gerarToken(user) {
  return jwt.sign(
    { sub: String(user.id), papel: user.papel, matricula: user.matricula ?? undefined },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

exports.login = async (req, res) => {
  const { email, matricula, senha } = req.body;
  const where = email ? { email, papel: 'professora' } : { matricula, papel: 'aluno' };

  const user = await User.scope('comSenha').findOne({ where });
  const valida = await bcrypt.compare(senha, user ? user.senha : DUMMY_HASH);

  if (!user || !valida) throw AppError.unauthorized('Credenciais inválidas');
  if (!user.ativo) throw AppError.forbidden('Usuário desativado');

  res.json({ token: gerarToken(user), tokenType: 'Bearer', expiresIn: env.JWT_EXPIRES_IN, user });
};

exports.me = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) throw AppError.notFound('Usuário não encontrado');
  res.json(user);
};
