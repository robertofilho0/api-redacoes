const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login/professora', authController.loginProfessora);
router.post('/login/aluno', authController.loginAluno);

module.exports = router;
