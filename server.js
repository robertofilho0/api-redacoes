require('dotenv').config();
const { sequelize } = require('./src/models');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao conectar com o banco:', err);
});
