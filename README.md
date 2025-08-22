# 📝 API de Notas de Redações - Node.js + Express + MySQL + JWT

API para gerenciamento das notas de redações dos alunos do 3º ano, com operações CRUD, autenticação via JWT e integração com banco de dados MySQL.  
O foco deste projeto é exclusivamente back-end, com a API estruturada para segurança e escalabilidade.

## 📌 Ajustes e melhorias
O projeto ainda está em desenvolvimento e as próximas atualizações serão voltadas para as seguintes tarefas:

- [x] CRUD completo de notas de redações  
- [x] Autenticação e autorização via **JWT**  
- [x] Integração com banco de dados **MySQL**  
- [ ] Documentação Swagger/OpenAPI  
- [ ] Testes automatizados  
- [ ] Relatórios em PDF/CSV para exportação  

## 💻 Pré-requisitos
Antes de começar, verifique se você possui:

- **Node.js** 20.x ou superior  
- **npm** ou **yarn**  
- Banco de dados **MySQL** configurado  

Compatível com **Windows**, **Linux** e **macOS**

## 🚀 Instalando a API de Notas de Redações

**1. Clone o repositório:**

```bash
git clone https://github.com/RobertoTheDev/api-redacoes.git
cd api-redacoes
```
**2. Instale as dependências:**

```bash
npm install
```

**3. Configure o arquivo .env:**

```.env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=senha
DB_NAME=exemplo_db
JWT_SECRET=sua_chave_secreta
```

**4. Execute as migrações (se configuradas):**

```bash
npm run migrate
```

**5. Inicie o servidor local:**

```bash
npm run dev
```

## 📡 Endpoints da API:

**🔑 Autenticação (/api/auth)**
| Método | Endpoint                   | Auth | Descrição                          |
| ------ | -------------------------- | ---- | ---------------------------------- |
| POST   | /api/auth/login/professora | ❌    | Login para professora (gera token) |
| POST   | /api/auth/login/aluno      | ❌    | Login para aluno (gera token)      |

**👤 Usuários (/api/users)**

| Método | Endpoint            | Auth | Descrição                           |
| ------ | ------------------- | ---- | ----------------------------------- |
| GET    | /api/users/alunos   | ❌    | Listar todos os alunos              |
| POST   | /api/users/usuarios | ❌    | Criar usuário (professora ou aluno) |

**📝 Notas (/api/notas) – 🔒 exige autenticação via JWT**
| Método | Endpoint                     | Auth | Descrição                           |
| ------ | ---------------------------- | ---- | ----------------------------------- |
| POST   | /api/notas                   | 🔒   | Criar nova nota                     |
| GET    | /api/notas                   | 🔒   | Listar todas as notas               |
| GET    | /api/notas/aluno/\:matricula | 🔒   | Listar notas de um aluno específico |
| PUT    | /api/notas/\:id              | 🔒   | Atualizar nota                      |
| DELETE | /api/notas/\:id              | 🔒   | Remover nota                        |

### ☕ Exemplos curl:

**Login professora:**
```bash
curl -X POST http://localhost:3001/api/auth/login/professora \
-H "Content-Type: application/json" \
-d '{"email":"professora@example.com","password":"senha123"}'
```
**Login aluno:**
```bash
curl -X POST http://localhost:3001/api/auth/login/aluno \
-H "Content-Type: application/json" \
-d '{"matricula":"2025001","password":"senha123"}'
```
**Criar nota:**
```bash
curl -X POST http://localhost:3001/api/notas \
-H "Authorization: Bearer SEU_TOKEN_AQUI" \
-H "Content-Type: application/json" \
-d '{"alunoId":1,"nota":8.7,"comentario":"Boa argumentação"}'
```
**Listar notas de um aluno:**
```bash
curl -X GET http://localhost:3001/api/notas/aluno/2025001 \
-H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🛠 Tecnologias utilizadas: 
- **Node.js** 20.x

- **Express**

- **MySQL**

- **JWT** (JSON Web Token)

- **Nodemon** (ambiente de desenvolvimento)