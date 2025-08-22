const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    nome: { type: DataTypes.STRING, allowNull: false },
    matricula: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    serie: { type: DataTypes.STRING, allowNull: false },
    senha: { type: DataTypes.STRING, allowNull: false },
    papel: {
      type: DataTypes.ENUM('aluno', 'professora'),
      defaultValue: 'aluno',
      allowNull: false
    }
  }, {
    defaultScope: {
      attributes: { exclude: ['senha'] }
    }
  });

  return User;
};
