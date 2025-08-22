const express = require('express');
const router = express.Router();
const notasController = require('../controllers/notasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', notasController.criarNota);
router.get('/', notasController.listarNotas);
router.get('/aluno/:matricula', notasController.listarNotasPorAluno);
router.put('/:id', notasController.atualizarNota);
router.delete('/:id', notasController.removerNota);

module.exports = router;
