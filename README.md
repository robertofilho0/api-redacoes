# 📝 API de Notas de Redação · Laravel

[![CI](https://github.com/robertofilho0/api-redacoes/actions/workflows/ci.yml/badge.svg)](https://github.com/robertofilho0/api-redacoes/actions/workflows/ci.yml)
![PHP](https://img.shields.io/badge/php-8.3%20%7C%208.4-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/laravel-12-FF2D20?logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-8-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

API em **Laravel 12** para a gestão das notas de redação dos alunos do 3º ano. A **professora** cadastra alunos, lança e corrige notas e acompanha as estatísticas da turma. Cada **aluno** acessa apenas o próprio boletim. Autenticação por token com **Sanctum**.

## ✨ Funcionalidades

- **Dois perfis** em uma única tabela `users` (Enum `Papel`): professora entra por **e-mail**, aluno por **matrícula**, ambos com senha
- **Autorização com Gates**: só a professora cadastra usuários e lança, edita ou remove notas. O aluno só vê as próprias notas e o próprio boletim
- **Média ponderada calculada no model** (evento `saving`): `(nota1 × peso1 + nota2 × peso2) / (peso1 + peso2)`, com pesos 1 e 2 por padrão. O cliente não pode enviar a média
- **Boletim** com os 4 bimestres, média geral e situação (aprovado, abaixo da média ou sem notas)
- **Estatísticas da turma** por série e bimestre: média, maior e menor nota, alunos acima da média e distribuição (insuficiente, regular, bom, excelente)
- Desativação de contas, rate limit no login e respostas idênticas para credenciais inválidas
- Form Requests com regras condicionais por papel, API Resources, Service (`BoletimService`), Factories e Seeder
- **Testes PHPUnit**, **Pint** e **CI** em PHP 8.3 e 8.4, com um job que roda as migrations num **MySQL 8**

## 🧱 Stack

PHP 8.3+ · Laravel 12 · Sanctum 4 · MySQL 8 ou SQLite · PHPUnit · Pint · Docker

## 🚀 Como rodar

```bash
git clone https://github.com/robertofilho0/api-redacoes.git
cd api-redacoes
composer install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

**Usuários de demonstração** (senha `Senha123`): professora `beth@escola.com` e alunos `2025001`, `2025002` e `2025003`.

Com Docker (MySQL): `export APP_KEY=$(php artisan key:generate --show) && docker compose up --build`.

## 📚 Endpoints

| Método   | Rota                            | Acesso            | Descrição                               |
| -------- | ------------------------------- | ----------------- | --------------------------------------- |
| `POST`   | `/api/login`                    | público           | `{ email, password }` ou `{ matricula, password }` |
| `GET`    | `/api/me`                       | autenticado       | Usuário logado                          |
| `POST`   | `/api/logout`                   | autenticado       | Revoga o token                          |
| `POST`   | `/api/users`                    | professora        | Cadastra aluno ou professora            |
| `GET`    | `/api/users/alunos`             | professora        | Lista alunos (`serie`, `busca`)         |
| `PATCH`  | `/api/users/{id}`               | professora        | Atualiza ou desativa usuário            |
| `GET`    | `/api/notas`                    | autenticado       | Lista notas (aluno vê só as próprias)   |
| `POST`   | `/api/notas`                    | professora        | Lança nota                              |
| `PUT`    | `/api/notas/{id}`               | professora        | Atualiza (recalcula a média)            |
| `DELETE` | `/api/notas/{id}`               | professora        | Remove                                  |
| `GET`    | `/api/notas/aluno/{matricula}`  | professora/aluno  | Boletim                                 |
| `GET`    | `/api/notas/estatisticas`       | professora        | Estatísticas da turma                   |

```bash
curl -X POST http://localhost:8000/api/notas \
  -H "Authorization: Bearer <TOKEN>" -H "Accept: application/json" \
  -d matricula=2025001 -d bimestre=1 -d nota1=8 -d nota2=9 -d tema="Educação digital"
# → { "data": { "media": 8.67, "aluno": { "matricula": "2025001" }, "lancada_por": "Professora Beth", … } }
```

## 🧪 Testes

```bash
composer test     # PHPUnit com SQLite em memória
composer lint     # Pint
```

## 📄 Licença

MIT.

---

Feito por [Roberto Filho](https://github.com/robertofilho0) · [LinkedIn](https://www.linkedin.com/in/roberto-filho-393b372b2/)
