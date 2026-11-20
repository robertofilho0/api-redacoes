const { Router } = require('express');
const controller = require('../controllers/nota.controller');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const schemas = require('../validators/schemas');

const router = Router();
const professora = authorize('professora');

router.use(authenticate);

router.get('/', validate({ query: schemas.listarNotas }), controller.listar);
router.get(
  '/estatisticas',
  professora,
  validate({ query: schemas.estatisticas }),
  controller.estatisticas,
);
router.get('/aluno/:matricula', validate({ params: schemas.matriculaParams }), controller.boletim);
router.post('/', professora, validate({ body: schemas.criarNota }), controller.criar);
router.put(
  '/:id',
  professora,
  validate({ params: schemas.idParams, body: schemas.atualizarNota }),
  controller.atualizar,
);
router.delete('/:id', professora, validate({ params: schemas.idParams }), controller.remover);

module.exports = router;
