const request = require('supertest');
const f = require('./helpers/factory');

afterAll(() => f.sequelize.close());

describe('Infraestrutura', () => {
  it('health check verifica o banco', async () => {
    const res = await request(f.app).get('/health');
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('404 padronizado', async () => {
    expect((await request(f.app).get('/api/nada')).status).toBe(404);
  });

  it('rotas de notas exigem token', async () => {
    expect((await request(f.app).get('/api/notas')).status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const res = await request(f.app).get('/api/notas').set(f.bearer('abc.def.ghi'));
    expect(res.status).toBe(401);
  });
});
