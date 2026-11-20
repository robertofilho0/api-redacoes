'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), unique: true },
      matricula: { type: Sequelize.STRING(20), unique: true },
      serie: { type: Sequelize.STRING(20) },
      senha: { type: Sequelize.STRING, allowNull: false },
      papel: {
        type: Sequelize.ENUM('aluno', 'professora'),
        allowNull: false,
        defaultValue: 'aluno',
      },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
