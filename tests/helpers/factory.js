const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');

const SENHA = 'Senha123';

async function resetDb() {
  await sequelize.sync({ force: true });
}

async function criarProfessora(dados = {}) {
  return User.create({
    nome: 'Professora Beth',
    email: 'beth@escola.com',
    senha: SENHA,
    papel: 'professora',
    ...dados,
  });
}

async function criarAluno(dados = {}) {
  return User.create({
    nome: 'Ana Lima',
    matricula: '2025001',
    serie: '3A',
    senha: SENHA,
    papel: 'aluno',
    ...dados,
  });
}

async function loginProfessora(email = 'beth@escola.com') {
  const res = await request(app).post('/api/auth/login').send({ email, senha: SENHA });
  return res.body.token;
}

async function loginAluno(matricula = '2025001') {
  const res = await request(app).post('/api/auth/login').send({ matricula, senha: SENHA });
  return res.body.token;
}

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = {
  app,
  sequelize,
  SENHA,
  resetDb,
  criarProfessora,
  criarAluno,
  loginProfessora,
  loginAluno,
  bearer,
};
