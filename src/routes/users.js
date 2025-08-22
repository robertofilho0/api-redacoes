const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/alunos', userController.listarAlunos);
router.post('/usuarios', userController.criarUsuario);

module.exports = router;
