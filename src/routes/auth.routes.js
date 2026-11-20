const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const schemas = require('../validators/schemas');
const env = require('../config/env');

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

router.post('/login', loginLimiter, validate({ body: schemas.login }), controller.login);
router.get('/me', authenticate, controller.me);

module.exports = router;
