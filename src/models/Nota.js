const { DataTypes } = require('sequelize');

const arredondar = (n) => Math.round(n * 100) / 100;

/** Média ponderada: (nota1 * peso1 + nota2 * peso2) / (peso1 + peso2) */
const calcularMedia = ({ nota1, nota2, peso1 = 1, peso2 = 2 }) =>
  arredondar((nota1 * peso1 + nota2 * peso2) / (peso1 + peso2));

module.exports = (sequelize) => {
  // Função (e não objeto) porque o Sequelize altera a definição de cada atributo
  const nota = () => ({
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    validate: { min: 0, max: 10 },
  });

  const Nota = sequelize.define(
    'Nota',
    {
      alunoId: { type: DataTypes.INTEGER, allowNull: false },
      professoraId: { type: DataTypes.INTEGER },
      disciplina: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'Redação' },
      tema: { type: DataTypes.STRING(200) },
      bimestre: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 4 } },
      nota1: nota(),
      nota2: nota(),
      peso1: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1, validate: { min: 1 } },
      peso2: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 2, validate: { min: 1 } },
      media: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 0 },
      comentario: { type: DataTypes.TEXT },
    },
    {
      tableName: 'notas',
      hooks: {
        // A média é sempre calculada no servidor
        beforeSave: (n) => {
          n.media = calcularMedia({
            nota1: Number(n.nota1),
            nota2: Number(n.nota2),
            peso1: Number(n.peso1 ?? 1),
            peso2: Number(n.peso2 ?? 2),
          });
        },
      },
    },
  );

  // DECIMAL vem como string do MySQL: devolve número na API
  Nota.prototype.toJSON = function () {
    const dados = { ...this.get() };
    for (const campo of ['nota1', 'nota2', 'media']) {
      if (dados[campo] !== undefined && dados[campo] !== null) dados[campo] = Number(dados[campo]);
    }
    return dados;
  };

  Nota.calcularMedia = calcularMedia;
  return Nota;
};
