const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig);

const User = require('./User')(sequelize);
const Nota = require('./Nota')(sequelize);

// Associações
User.hasMany(Nota, { foreignKey: 'userId' });
Nota.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Nota
};
