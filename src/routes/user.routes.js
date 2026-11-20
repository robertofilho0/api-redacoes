const { Router } = require('express');
const controller = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const schemas = require('../validators/schemas');

const router = Router();

router.use(authenticate, authorize('professora'));

router.post('/', validate({ body: schemas.criarUsuario }), controller.criar);
router.get('/alunos', validate({ query: schemas.listarAlunos }), controller.listarAlunos);
router.patch(
  '/:id',
  validate({ params: schemas.idParams, body: schemas.atualizarUsuario }),
  controller.atualizar,
);

module.exports = router;
