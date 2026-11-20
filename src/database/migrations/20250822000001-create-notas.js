'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      aluno_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      professora_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      disciplina: { type: Sequelize.STRING(60), allowNull: false, defaultValue: 'Redação' },
      tema: { type: Sequelize.STRING(200) },
      bimestre: { type: Sequelize.TINYINT, allowNull: false },
      nota1: { type: Sequelize.DECIMAL(4, 2), allowNull: false },
      nota2: { type: Sequelize.DECIMAL(4, 2), allowNull: false },
      peso1: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      peso2: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 2 },
      media: { type: Sequelize.DECIMAL(4, 2), allowNull: false, defaultValue: 0 },
      comentario: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('notas', ['aluno_id', 'bimestre']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notas');
  },
};
