const { z } = require('zod');

const matricula = z
  .string()
  .trim()
  .regex(/^\d{4,20}$/, 'matrícula deve conter apenas números');
const senha = z
  .string()
  .min(8, 'A senha deve ter ao menos 8 caracteres')
  .regex(/[A-Za-z]/, 'A senha deve conter letras')
  .regex(/\d/, 'A senha deve conter números');
const nota = z.number().min(0, 'A nota mínima é 0').max(10, 'A nota máxima é 10');
const id = z.coerce.number().int().positive('ID inválido');

const login = z
  .object({
    email: z.email().trim().toLowerCase().optional(),
    matricula: matricula.optional(),
    senha: z.string().min(1, 'Informe a senha'),
  })
  .strict()
  .refine((d) => Boolean(d.email) !== Boolean(d.matricula), {
    message: 'Informe o e-mail (professora) ou a matrícula (aluno)',
    path: ['email'],
  });

const criarUsuario = z.discriminatedUnion('papel', [
  z
    .object({
      papel: z.literal('aluno'),
      nome: z.string().trim().min(3).max(100),
      matricula,
      serie: z.string().trim().min(1).max(20),
      senha,
    })
    .strict(),
  z
    .object({
      papel: z.literal('professora'),
      nome: z.string().trim().min(3).max(100),
      email: z.email().trim().toLowerCase(),
      senha,
    })
    .strict(),
]);

const atualizarUsuario = z
  .object({
    nome: z.string().trim().min(3).max(100),
    serie: z.string().trim().min(1).max(20),
    ativo: z.boolean(),
    senha,
  })
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'Informe ao menos um campo' });

const listarAlunos = z.object({
  serie: z.string().trim().optional(),
  busca: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const notaBase = {
  matricula,
  disciplina: z.string().trim().min(2).max(60).optional(),
  tema: z.string().trim().max(200).optional(),
  bimestre: z.number().int().min(1).max(4),
  nota1: nota,
  nota2: nota,
  peso1: z.number().int().min(1).max(10).optional(),
  peso2: z.number().int().min(1).max(10).optional(),
  comentario: z.string().trim().max(2000).optional(),
};

const criarNota = z.object(notaBase).strict();

const atualizarNota = z
  .object(notaBase)
  .omit({ matricula: true })
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'Informe ao menos um campo' });

const listarNotas = z.object({
  matricula: matricula.optional(),
  serie: z.string().trim().optional(),
  bimestre: z.coerce.number().int().min(1).max(4).optional(),
  disciplina: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const estatisticas = z.object({
  serie: z.string().trim().optional(),
  bimestre: z.coerce.number().int().min(1).max(4).optional(),
});

module.exports = {
  id,
  idParams: z.object({ id }),
  matriculaParams: z.object({ matricula }),
  login,
  criarUsuario,
  atualizarUsuario,
  listarAlunos,
  criarNota,
  atualizarNota,
  listarNotas,
  estatisticas,
};
