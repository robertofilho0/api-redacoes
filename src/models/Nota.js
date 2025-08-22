const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Nota = sequelize.define('Nota', {
    disciplina: DataTypes.STRING,
    nota1: DataTypes.FLOAT,
    nota2: DataTypes.FLOAT,
    peso1: { type: DataTypes.INTEGER, defaultValue: 1 },
    peso2: { type: DataTypes.INTEGER, defaultValue: 2 },
    bimestre: DataTypes.STRING,
    media: DataTypes.FLOAT,
    userId: DataTypes.INTEGER
  });

  return Nota;
};
