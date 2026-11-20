const request = require('supertest');
const f = require('./helpers/factory');

beforeEach(async () => {
  await f.resetDb();
  await f.criarProfessora();
  await f.criarAluno();
});
afterAll(() => f.sequelize.close());

describe('Login', () => {
  it('professora entra com e-mail e senha', async () => {
    const res = await request(f.app)
      .post('/api/auth/login')
      .send({ email: 'BETH@escola.com', senha: f.SENHA });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ papel: 'professora', email: 'beth@escola.com' });
    expect(res.body.user.senha).toBeUndefined();
  });

  it('aluno entra com matrícula e senha', async () => {
    const res = await request(f.app)
      .post('/api/auth/login')
      .send({ matricula: '2025001', senha: f.SENHA });
    expect(res.status).toBe(200);
    expect(res.body.user.papel).toBe('aluno');
  });

  it('aluno não entra sem senha (falha de segurança da versão anterior)', async () => {
    const res = await request(f.app).post('/api/auth/login').send({ matricula: '2025001' });
    expect(res.status).toBe(400);
  });

  it('rejeita senha errada e usuário inexistente com a mesma resposta', async () => {
    const errada = await request(f.app)
      .post('/api/auth/login')
      .send({ matricula: '2025001', senha: 'Errada123' });
    const inexistente = await request(f.app)
      .post('/api/auth/login')
      .send({ matricula: '9999', senha: f.SENHA });
    expect(errada.status).toBe(401);
    expect(inexistente.body).toEqual(errada.body);
  });

  it('aluno não consegue logar como professora', async () => {
    const res = await request(f.app)
      .post('/api/auth/login')
      .send({ email: 'ana@x.com', senha: f.SENHA });
    expect(res.status).toBe(401);
  });

  it('exige e-mail OU matrícula', async () => {
    const res = await request(f.app)
      .post('/api/auth/login')
      .send({ email: 'beth@escola.com', matricula: '2025001', senha: f.SENHA });
    expect(res.status).toBe(400);
  });

  it('bloqueia usuário desativado', async () => {
    await f.criarAluno({ matricula: '2025009', ativo: false });
    const res = await request(f.app)
      .post('/api/auth/login')
      .send({ matricula: '2025009', senha: f.SENHA });
    expect(res.status).toBe(403);
  });

  it('GET /api/auth/me retorna o usuário do token', async () => {
    const token = await f.loginAluno();
    const res = await request(f.app).get('/api/auth/me').set(f.bearer(token));
    expect(res.body).toMatchObject({ matricula: '2025001', nome: 'Ana Lima' });
  });

  it('armazena a senha com hash', async () => {
    const { User } = require('../src/models');
    const user = await User.scope('comSenha').findOne({ where: { matricula: '2025001' } });
    expect(user.senha).toMatch(/^\$2[aby]\$/);
  });
});

describe('Usuários', () => {
  it('somente professora cadastra usuários', async () => {
    const semToken = await request(f.app).post('/api/users').send({});
    expect(semToken.status).toBe(401);

    const tokenAluno = await f.loginAluno();
    const comoAluno = await request(f.app)
      .post('/api/users')
      .set(f.bearer(tokenAluno))
      .send({ papel: 'professora', nome: 'Hacker', email: 'h@x.com', senha: 'Senha123' });
    expect(comoAluno.status).toBe(403);
  });

  it('professora cadastra aluno e impede matrícula duplicada', async () => {
    const token = await f.loginProfessora();
    const novo = {
      papel: 'aluno',
      nome: 'Bruno Costa',
      matricula: '2025002',
      serie: '3A',
      senha: 'Senha123',
    };

    const res = await request(f.app).post('/api/users').set(f.bearer(token)).send(novo);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ nome: 'Bruno Costa', papel: 'aluno' });
    expect(res.body.senha).toBeUndefined();

    const dup = await request(f.app).post('/api/users').set(f.bearer(token)).send(novo);
    expect(dup.status).toBe(409);
  });

  it('valida campos por papel', async () => {
    const token = await f.loginProfessora();
    const alunoSemMatricula = await request(f.app)
      .post('/api/users')
      .set(f.bearer(token))
      .send({ papel: 'aluno', nome: 'Sem Matricula', serie: '3A', senha: 'Senha123' });
    expect(alunoSemMatricula.status).toBe(400);

    const senhaFraca = await request(f.app)
      .post('/api/users')
      .set(f.bearer(token))
      .send({ papel: 'professora', nome: 'Profa', email: 'p@x.com', senha: '123' });
    expect(senhaFraca.status).toBe(400);
  });

  it('lista e busca alunos com paginação', async () => {
    await f.criarAluno({ nome: 'Bruno Costa', matricula: '2025002', serie: '3B' });
    const token = await f.loginProfessora();

    const todos = await request(f.app).get('/api/users/alunos').set(f.bearer(token));
    expect(todos.body.meta.total).toBe(2);

    const porSerie = await request(f.app).get('/api/users/alunos?serie=3B').set(f.bearer(token));
    expect(porSerie.body.data.map((a) => a.nome)).toEqual(['Bruno Costa']);

    const busca = await request(f.app).get('/api/users/alunos?busca=ana').set(f.bearer(token));
    expect(busca.body.data.map((a) => a.nome)).toEqual(['Ana Lima']);
  });

  it('desativa aluno, mas não a própria conta', async () => {
    const token = await f.loginProfessora();
    const { User } = require('../src/models');
    const aluno = await User.findOne({ where: { matricula: '2025001' } });
    const prof = await User.findOne({ where: { papel: 'professora' } });

    const res = await request(f.app)
      .patch(`/api/users/${aluno.id}`)
      .set(f.bearer(token))
      .send({ ativo: false });
    expect(res.body.ativo).toBe(false);

    const propria = await request(f.app)
      .patch(`/api/users/${prof.id}`)
      .set(f.bearer(token))
      .send({ ativo: false });
    expect(propria.status).toBe(400);
  });
});
