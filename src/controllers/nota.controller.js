const { User, Nota } = require('../models');
const AppError = require('../utils/AppError');
const boletimService = require('../services/boletim.service');

async function buscarAluno(matricula) {
  const aluno = await User.findOne({ where: { matricula, papel: 'aluno' } });
  if (!aluno) throw AppError.notFound('Aluno não encontrado');
  return aluno;
}

async function buscarNota(id) {
  const nota = await Nota.findByPk(id);
  if (!nota) throw AppError.notFound('Nota não encontrada');
  return nota;
}

const incluirAluno = { model: User, as: 'aluno', attributes: ['id', 'nome', 'matricula', 'serie'] };

exports.criar = async (req, res) => {
  const { matricula, ...dados } = req.body;
  const aluno = await buscarAluno(matricula);
  const nota = await Nota.create({ ...dados, alunoId: aluno.id, professoraId: req.user.id });
  res.status(201).json(await Nota.findByPk(nota.id, { include: [incluirAluno] }));
};

exports.listar = async (req, res) => {
  const { matricula, serie, bimestre, disciplina, page, limit } = req.validated.query;
  const where = {};
  const alunoWhere = {};

  // Aluno só enxerga as próprias notas
  if (req.user.papel === 'aluno') where.alunoId = req.user.id;
  else if (matricula) alunoWhere.matricula = matricula;

  if (serie) alunoWhere.serie = serie;
  if (bimestre) where.bimestre = bimestre;
  if (disciplina) where.disciplina = disciplina;

  const { count, rows } = await Nota.findAndCountAll({
    where,
    include: [{ ...incluirAluno, where: Object.keys(alunoWhere).length ? alunoWhere : undefined }],
    order: [
      ['bimestre', 'ASC'],
      ['createdAt', 'ASC'],
    ],
    offset: (page - 1) * limit,
    limit,
  });

  res.json({
    data: rows,
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 },
  });
};

exports.boletim = async (req, res) => {
  const { matricula } = req.validated.params;
  if (req.user.papel === 'aluno' && req.user.matricula !== matricula) {
    throw AppError.forbidden('Você só pode consultar o próprio boletim');
  }
  const aluno = await buscarAluno(matricula);
  const notas = await Nota.findAll({ where: { alunoId: aluno.id }, order: [['createdAt', 'ASC']] });
  res.json(boletimService.montarBoletim(aluno, notas));
};

exports.atualizar = async (req, res) => {
  const nota = await buscarNota(req.validated.params.id);
  await nota.update(req.body);
  res.json(await Nota.findByPk(nota.id, { include: [incluirAluno] }));
};

exports.remover = async (req, res) => {
  const nota = await buscarNota(req.validated.params.id);
  await nota.destroy();
  res.status(204).end();
};

exports.estatisticas = async (req, res) => {
  const { serie, bimestre } = req.validated.query;
  const notas = await Nota.findAll({
    where: bimestre ? { bimestre } : {},
    include: [{ ...incluirAluno, where: serie ? { serie } : undefined }],
    attributes: ['media'],
  });
  res.json({
    filtros: { serie: serie ?? null, bimestre: bimestre ?? null },
    ...boletimService.estatisticas(notas),
  });
};
