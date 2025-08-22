const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas (caminho relativo a partir de src/app.js)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const notaRoutes = require('./routes/notas');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/notas', notaRoutes);

// Rota raiz de teste
app.get('/', (req, res) => {
  res.send('API do Projeto Beth rodando!');
});

module.exports = app;
