const { Op } = require('sequelize');
const { User } = require('../models');
const AppError = require('../utils/AppError');

exports.criar = async (req, res) => {
  const { papel, email, matricula } = req.body;
  const where = papel === 'professora' ? { email } : { matricula };
  if (await User.findOne({ where })) {
    throw AppError.conflict(
      papel === 'professora' ? 'E-mail já cadastrado' : 'Matrícula já cadastrada',
    );
  }

  const user = await User.create(req.body);
  res.status(201).json(await User.findByPk(user.id));
};

exports.listarAlunos = async (req, res) => {
  const { serie, busca, page, limit } = req.validated.query;
  const where = { papel: 'aluno' };
  if (serie) where.serie = serie;
  if (busca) {
    where[Op.or] = [
      { nome: { [Op.like]: `%${busca}%` } },
      { matricula: { [Op.like]: `${busca}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    order: [['nome', 'ASC']],
    offset: (page - 1) * limit,
    limit,
  });

  res.json({
    data: rows,
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 },
  });
};

exports.atualizar = async (req, res) => {
  const user = await User.findByPk(req.validated.params.id);
  if (!user) throw AppError.notFound('Usuário não encontrado');
  if (user.id === req.user.id && req.body.ativo === false) {
    throw AppError.badRequest('Você não pode desativar a própria conta');
  }
  await user.update(req.body);
  res.json(await User.findByPk(user.id));
};
