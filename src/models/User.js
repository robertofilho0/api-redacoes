const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const PAPEIS = ['aluno', 'professora'];

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      nome: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), unique: true, validate: { isEmail: true } },
      matricula: { type: DataTypes.STRING(20), unique: true },
      serie: { type: DataTypes.STRING(20) },
      senha: { type: DataTypes.STRING, allowNull: false },
      papel: { type: DataTypes.ENUM(...PAPEIS), allowNull: false, defaultValue: 'aluno' },
      ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'users',
      defaultScope: { attributes: { exclude: ['senha'] } },
      scopes: { comSenha: { attributes: { include: ['senha'] } } },
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('senha')) user.senha = await bcrypt.hash(user.senha, env.BCRYPT_ROUNDS);
        },
      },
    },
  );

  User.prototype.verificarSenha = function (senha) {
    return bcrypt.compare(senha, this.senha);
  };

  User.prototype.toJSON = function () {
    const { senha: _senha, ...dados } = this.get();
    return dados;
  };

  User.PAPEIS = PAPEIS;
  return User;
};
