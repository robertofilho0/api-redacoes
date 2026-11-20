const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config);

const User = require('./User')(sequelize);
const Nota = require('./Nota')(sequelize);

User.hasMany(Nota, { foreignKey: 'alunoId', as: 'notas' });
Nota.belongsTo(User, { foreignKey: 'alunoId', as: 'aluno' });
Nota.belongsTo(User, { foreignKey: 'professoraId', as: 'professora' });

module.exports = { sequelize, Sequelize, User, Nota };
