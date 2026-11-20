const env = require('./env');

/** Configuração usada pela aplicação e pelo sequelize-cli (migrations e seeders). */
const base =
  env.DB_DIALECT === 'sqlite'
    ? { dialect: 'sqlite', storage: env.DB_STORAGE }
    : {
        dialect: 'mysql',
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        timezone: '-03:00',
      };

const config = {
  ...base,
  logging: false,
  define: { underscored: true, timestamps: true },
};

module.exports = { development: config, test: config, production: config, ...config };
