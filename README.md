# 📝 API de Notas de Redação

[![CI](https://github.com/robertofilho0/api-redacoes/actions/workflows/ci.yml/badge.svg)](https://github.com/robertofilho0/api-redacoes/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-5-000000?logo=express)
![MySQL](https://img.shields.io/badge/mysql-8-4479A1?logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/sequelize-6-52B0E7?logo=sequelize&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

API para a gestão das notas de redação dos alunos do 3º ano. A **professora** cadastra alunos, lança e corrige notas e acompanha as estatísticas da turma. Cada **aluno** acessa apenas o próprio boletim.

## ✨ Funcionalidades

- **Dois perfis de acesso** com JWT: professora (login por e-mail) e aluno (login por matrícula), ambos com senha
- **Autorização por papel**: só a professora cadastra usuários e lança, edita ou remove notas
- **Isolamento de dados**: o aluno só vê as próprias notas e o próprio boletim
- **Média ponderada calculada no servidor**: `(nota1 × peso1 + nota2 × peso2) / (peso1 + peso2)`, com pesos 1 e 2 por padrão
- **Boletim** com média por bimestre, média geral e situação (aprovado ou abaixo da média)
- **Estatísticas da turma** por série e bimestre: média, maior e menor nota, alunos acima da média e distribuição por faixas
- **Migrations e seeders** com `sequelize-cli`, validadas no CI contra um MySQL real
- Validação com **Zod**, senhas com **bcrypt**, rate limit no login, **Helmet**, **CORS** e health check com verificação do banco
- **Swagger UI** em `/docs`
- **29 testes de integração** (Jest + Supertest) rodando em SQLite em memória, sem precisar de MySQL
- **Docker Compose** com API + MySQL, aplicando as migrations automaticamente

## 🧱 Stack

Node.js 22+ · Express 5 · Sequelize 6 · MySQL 8 (SQLite nos testes) · JWT · Zod · Jest · Supertest · Docker

## 📁 Estrutura

```
src/
├── app.js / server.js
├── config/            # env validado e configuração do banco
├── database/
│   ├── migrations/    # criação das tabelas users e notas
│   └── seeders/       # dados de demonstração
├── models/            # User e Nota (hooks de hash da senha e cálculo da média)
├── services/          # boletim e estatísticas
├── controllers/ routes/ validators/ middlewares/
└── docs/openapi.json
tests/
```

## 🚀 Como rodar

### Com Docker (API + MySQL)

```bash
git clone https://github.com/robertofilho0/api-redacoes.git
cd api-redacoes
docker compose up --build
docker compose exec api npx sequelize-cli db:seed:all   # opcional: dados de demonstração
```

### Localmente com MySQL

```bash
npm install
cp .env.example .env    # ajuste as credenciais do banco e o JWT_SECRET
npm run db:migrate
npm run db:seed         # opcional
npm run dev
```

### Sem instalar banco (SQLite)

No `.env`, defina `DB_DIALECT=sqlite` e rode `npm run db:migrate && npm run db:seed && npm run dev`.

A API sobe em `http://localhost:3001` e a documentação em `http://localhost:3001/docs`.

**Usuários de demonstração** (senha `Senha123`): professora `beth@escola.com` e alunos `2025001`, `2025002` e `2025003`.

## 📚 Endpoints

| Método   | Rota                          | Acesso           | Descrição                              |
| -------- | ----------------------------- | ---------------- | -------------------------------------- |
| `POST`   | `/api/auth/login`             | público          | Login (e-mail ou matrícula + senha)    |
| `GET`    | `/api/auth/me`                | autenticado      | Usuário logado                         |
| `POST`   | `/api/users`                  | professora       | Cadastra aluno ou professora           |
| `GET`    | `/api/users/alunos`           | professora       | Lista alunos (série, busca, paginação) |
| `PATCH`  | `/api/users/:id`              | professora       | Atualiza ou desativa usuário           |
| `GET`    | `/api/notas`                  | autenticado      | Lista notas (aluno vê só as próprias)  |
| `POST`   | `/api/notas`                  | professora       | Lança nota                             |
| `PUT`    | `/api/notas/:id`              | professora       | Atualiza nota (recalcula a média)      |
| `DELETE` | `/api/notas/:id`              | professora       | Remove nota                            |
| `GET`    | `/api/notas/aluno/:matricula` | professora/aluno | Boletim do aluno                       |
| `GET`    | `/api/notas/estatisticas`     | professora       | Estatísticas da turma                  |

### Exemplos

```bash
# Login da professora
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"beth@escola.com","senha":"Senha123"}'

# Lançar nota
curl -X POST http://localhost:3001/api/notas \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"matricula":"2025001","bimestre":1,"tema":"Educação digital","nota1":8,"nota2":9,"comentario":"Boa argumentação"}'

# Boletim (o aluno pode consultar o próprio)
curl http://localhost:3001/api/notas/aluno/2025001 -H "Authorization: Bearer <TOKEN>"
```

Exemplo de boletim:

```json
{
  "aluno": { "id": 2, "nome": "Ana Lima", "matricula": "2025001", "serie": "3A" },
  "mediaGeral": 8.42,
  "situacao": "aprovado",
  "mediaAprovacao": 6,
  "bimestres": [
    { "bimestre": 1, "quantidade": 1, "media": 8.67, "notas": [] },
    { "bimestre": 2, "quantidade": 1, "media": 8.17, "notas": [] },
    { "bimestre": 3, "quantidade": 0, "media": null, "notas": [] },
    { "bimestre": 4, "quantidade": 0, "media": null, "notas": [] }
  ]
}
```

## ⚙️ Variáveis de ambiente

| Variável                                                      | Padrão                  | Descrição                               |
| ------------------------------------------------------------- | ----------------------- | --------------------------------------- |
| `PORT`                                                        | `3001`                  | Porta HTTP                              |
| `DB_DIALECT`                                                  | `mysql`                 | `mysql` ou `sqlite`                     |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | —                       | Conexão com o MySQL                     |
| `JWT_SECRET`                                                  | obrigatório             | Mínimo de 32 caracteres                 |
| `JWT_EXPIRES_IN`                                              | `8h`                    | Validade do token                       |
| `MEDIA_APROVACAO`                                             | `6`                     | Média mínima para a situação "aprovado" |
| `CORS_ORIGIN`                                                 | `http://localhost:5173` | Origens do front-end                    |

## 🧪 Testes

```bash
npm test               # SQLite em memória, sem precisar de MySQL
npm run test:coverage
npm run lint
```

## 📄 Licença

MIT. Veja [LICENSE](LICENSE).

---

Feito por [Roberto Filho](https://github.com/robertofilho0) · [LinkedIn](https://www.linkedin.com/in/roberto-filho-393b372b2/)
