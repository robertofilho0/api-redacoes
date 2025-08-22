const db = require('../models');

module.exports = async (req, res, next) => {
  try {
    const matricula = req.params.matricula || req.body.matricula;
    
    if (!matricula) {
      return next();
    }

    const aluno = await db.User.findOne({ 
      where: { 
        matricula,
        papel: 'aluno'
      }
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    req.aluno = aluno;
    next();
  } catch (error) {
    console.error('Erro no middleware de aluno:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};