const request = require('supertest');
const f = require('./helpers/factory');

let tokenProf;
let tokenAna;

beforeEach(async () => {
  await f.resetDb();
  await f.criarProfessora();
  await f.criarAluno();
  await f.criarAluno({ nome: 'Bruno Costa', matricula: '2025002', serie: '3B' });
  tokenProf = await f.loginProfessora();
  tokenAna = await f.loginAluno('2025001');
});
afterAll(() => f.sequelize.close());

const lancar = (dados) =>
  request(f.app)
    .post('/api/notas')
    .set(f.bearer(tokenProf))
    .send({ matricula: '2025001', bimestre: 1, nota1: 8, nota2: 9, ...dados });

describe('Lançamento de notas', () => {
  it('calcula a média ponderada no servidor', async () => {
    const res = await lancar({ tema: 'Educação digital', media: 0 });
    expect(res.status).toBe(400); // media não pode ser enviada

    const ok = await lancar({ tema: 'Educação digital' });
    expect(ok.status).toBe(201);
    expect(ok.body).toMatchObject({ nota1: 8, nota2: 9, media: 8.67, disciplina: 'Redação' });
    expect(ok.body.aluno).toMatchObject({ matricula: '2025001' });
  });

  it('respeita pesos personalizados', async () => {
    const res = await lancar({ nota1: 6, nota2: 10, peso1: 1, peso2: 1 });
    expect(res.body.media).toBe(8);
  });

  it('valida faixa das notas e bimestre', async () => {
    expect((await lancar({ nota1: 11 })).status).toBe(400);
    expect((await lancar({ nota2: -1 })).status).toBe(400);
    expect((await lancar({ bimestre: 5 })).status).toBe(400);
  });

  it('retorna 404 para aluno inexistente', async () => {
    expect((await lancar({ matricula: '9999' })).status).toBe(404);
  });

  it('aluno não pode lançar, editar nem remover notas', async () => {
    const { body: nota } = await lancar();
    const post = await request(f.app)
      .post('/api/notas')
      .set(f.bearer(tokenAna))
      .send({ matricula: '2025001', bimestre: 1, nota1: 10, nota2: 10 });
    const put = await request(f.app)
      .put(`/api/notas/${nota.id}`)
      .set(f.bearer(tokenAna))
      .send({ nota1: 10 });
    const del = await request(f.app).delete(`/api/notas/${nota.id}`).set(f.bearer(tokenAna));
    expect([post.status, put.status, del.status]).toEqual([403, 403, 403]);
  });

  it('atualiza recalculando a média e remove', async () => {
    const { body: nota } = await lancar();
    const upd = await request(f.app)
      .put(`/api/notas/${nota.id}`)
      .set(f.bearer(tokenProf))
      .send({ nota2: 6 });
    expect(upd.body).toMatchObject({ nota1: 8, nota2: 6, media: 6.67 });

    expect(
      (await request(f.app).delete(`/api/notas/${nota.id}`).set(f.bearer(tokenProf))).status,
    ).toBe(204);
    expect(
      (await request(f.app).delete(`/api/notas/${nota.id}`).set(f.bearer(tokenProf))).status,
    ).toBe(404);
  });
});

describe('Consulta', () => {
  beforeEach(async () => {
    await lancar({ bimestre: 1, nota1: 8, nota2: 9 });
    await lancar({ bimestre: 2, nota1: 4, nota2: 5 });
    await lancar({ matricula: '2025002', bimestre: 1, nota1: 10, nota2: 10 });
  });

  it('professora lista e filtra todas as notas', async () => {
    const todas = await request(f.app).get('/api/notas').set(f.bearer(tokenProf));
    expect(todas.body.meta.total).toBe(3);

    const porSerie = await request(f.app).get('/api/notas?serie=3B').set(f.bearer(tokenProf));
    expect(porSerie.body.data.map((n) => n.aluno.matricula)).toEqual(['2025002']);

    const porBimestre = await request(f.app).get('/api/notas?bimestre=2').set(f.bearer(tokenProf));
    expect(porBimestre.body.meta.total).toBe(1);
  });

  it('aluno vê apenas as próprias notas', async () => {
    const res = await request(f.app).get('/api/notas?matricula=2025002').set(f.bearer(tokenAna));
    expect(res.body.meta.total).toBe(2);
    expect(res.body.data.every((n) => n.aluno.matricula === '2025001')).toBe(true);
  });

  it('gera o boletim com médias por bimestre e situação', async () => {
    const res = await request(f.app).get('/api/notas/aluno/2025001').set(f.bearer(tokenAna));
    expect(res.status).toBe(200);
    expect(res.body.aluno).toMatchObject({ nome: 'Ana Lima', serie: '3A' });
    expect(res.body.bimestres.map((b) => b.media)).toEqual([8.67, 4.67, null, null]);
    expect(res.body).toMatchObject({ mediaGeral: 6.67, situacao: 'aprovado', mediaAprovacao: 6 });
  });

  it('aluno não acessa o boletim de outro aluno', async () => {
    const res = await request(f.app).get('/api/notas/aluno/2025002').set(f.bearer(tokenAna));
    expect(res.status).toBe(403);
  });

  it('estatísticas da turma (somente professora)', async () => {
    const negado = await request(f.app).get('/api/notas/estatisticas').set(f.bearer(tokenAna));
    expect(negado.status).toBe(403);

    const res = await request(f.app)
      .get('/api/notas/estatisticas?bimestre=1')
      .set(f.bearer(tokenProf));
    expect(res.body).toMatchObject({
      total: 2,
      mediaTurma: 9.34,
      maior: 10,
      menor: 8.67,
      acimaDaMedia: 2,
      distribuicao: { '0-4.9': 0, '5-6.9': 0, '7-8.9': 1, '9-10': 1 },
    });
  });
});
