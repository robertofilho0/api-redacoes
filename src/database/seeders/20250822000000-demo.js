'use strict';

const bcrypt = require('bcryptjs');

/** Dados de demonstração: 1 professora, 3 alunos e algumas notas. Senha de todos: Senha123 */
module.exports = {
  async up(queryInterface) {
    const senha = await bcrypt.hash('Senha123', 10);
    const agora = new Date();
    const base = { senha, ativo: true, created_at: agora, updated_at: agora };

    await queryInterface.bulkInsert('users', [
      { ...base, nome: 'Professora Beth', email: 'beth@escola.com', papel: 'professora' },
      { ...base, nome: 'Ana Lima', matricula: '2025001', serie: '3A', papel: 'aluno' },
      { ...base, nome: 'Bruno Costa', matricula: '2025002', serie: '3A', papel: 'aluno' },
      { ...base, nome: 'Carla Dias', matricula: '2025003', serie: '3B', papel: 'aluno' },
    ]);

    const [users] = await queryInterface.sequelize.query(
      "SELECT id, matricula FROM users WHERE papel = 'aluno' ORDER BY matricula",
    );
    const [professora] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE papel = 'professora' LIMIT 1",
    );
    const media = (n1, n2) => Math.round(((n1 + n2 * 2) / 3) * 100) / 100;
    const notas = [
      [0, 1, 8, 9],
      [0, 2, 7.5, 8.5],
      [1, 1, 5, 6],
      [1, 2, 6, 7],
      [2, 1, 9.5, 10],
    ].map(([aluno, bimestre, nota1, nota2]) => ({
      aluno_id: users[aluno].id,
      professora_id: professora[0].id,
      disciplina: 'Redação',
      tema: 'Desafios da educação digital no Brasil',
      bimestre,
      nota1,
      nota2,
      peso1: 1,
      peso2: 2,
      media: media(nota1, nota2),
      created_at: agora,
      updated_at: agora,
    }));

    await queryInterface.bulkInsert('notas', notas);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('notas', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
