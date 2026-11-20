const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  await sequelize.authenticate();
  console.log(`✅ Conectado ao banco (${env.DB_DIALECT})`);

  // SQLite (desenvolvimento rápido) cria as tabelas automaticamente.
  // Com MySQL, use as migrations: npm run db:migrate
  if (env.DB_DIALECT === 'sqlite') await sequelize.sync();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${env.PORT}`);
    console.log(`📚 Documentação em http://localhost:${env.PORT}/docs`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} recebido. Encerrando...`);
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('❌ Falha ao iniciar a aplicação:', err);
  process.exit(1);
});
