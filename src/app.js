const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const openapi = require('./docs/openapi.json');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const notaRoutes = require('./routes/nota.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '100kb' }));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
  }),
);

app.get('/health', async (_req, res) => {
  const database = await sequelize
    .authenticate()
    .then(() => 'up')
    .catch(() => 'down');
  res
    .status(database === 'up' ? 200 : 503)
    .json({ status: database === 'up' ? 'ok' : 'degraded', database });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notas', notaRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
