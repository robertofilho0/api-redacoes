const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authenticate(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(AppError.unauthorized('Token não fornecido'));

  const payload = jwt.verify(token, env.JWT_SECRET); // erros tratados no errorHandler
  req.user = { id: Number(payload.sub), papel: payload.papel, matricula: payload.matricula };
  return next();
}

const authorize =
  (...papeis) =>
  (req, _res, next) => {
    if (!papeis.includes(req.user?.papel)) {
      return next(AppError.forbidden('Você não tem permissão para acessar este recurso'));
    }
    return next();
  };

module.exports = { authenticate, authorize };
