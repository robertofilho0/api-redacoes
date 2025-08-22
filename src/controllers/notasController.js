const { Nota, User } = require('../models');

const calcularMedia = (nota1, nota2, peso1 = 1, peso2 = 2) => {
  return ((nota1 * peso1) + (nota2 * peso2)) / (peso1 + peso2);
};

module.exports = {
  async criarNota(req, res) {
    try {
      const { userId, disciplina, bimestre, nota1, nota2 } = req.body;
      const media = calcularMedia(nota1, nota2);

      const nota = await Nota.create({
        userId, disciplina, bimestre, nota1, nota2, media
      });

      res.status(201).json(nota);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao criar nota' });
    }
  },

  async listarNotas(req, res) {
    try {
      const notas = await Nota.findAll();
      res.json(notas);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar notas' });
    }
  },

  async listarNotasPorAluno(req, res) {
    try {
      const { matricula } = req.params;

      const aluno = await User.findOne({
        where: { matricula, papel: 'aluno' }
      });

      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

      const notas = await Nota.findAll({
        where: { userId: aluno.id },
        attributes: ['id', 'disciplina', 'bimestre', 'nota1', 'nota2', 'media']
      });

      res.json({
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          matricula: aluno.matricula,
          serie: aluno.serie
        },
        notas
      });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar notas do aluno' });
    }
  },

  async atualizarNota(req, res) {
    try {
      const { id } = req.params;
      const { nota1, nota2 } = req.body;

      const nota = await Nota.findByPk(id);
      if (!nota) return res.status(404).json({ error: 'Nota não encontrada' });

      const media = calcularMedia(nota1, nota2);
      await nota.update({ nota1, nota2, media });

      res.json(nota);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar nota' });
    }
  },

  async removerNota(req, res) {
    try {
      const { id } = req.params;
      const nota = await Nota.findByPk(id);

      if (!nota) return res.status(404).json({ error: 'Nota não encontrada' });

      await nota.destroy();
      res.json({ message: 'Nota removida com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao remover nota' });
    }
  }
};
