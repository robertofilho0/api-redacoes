require('dotenv').config({ quiet: true });
const { z } = require('zod');

const isTest = process.env.NODE_ENV === 'test';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  DB_DIALECT: z.enum(['mysql', 'sqlite']).default(isTest ? 'sqlite' : 'mysql'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('redacoes'),
  DB_STORAGE: z.string().default(':memory:'),

  JWT_SECRET: isTest
    ? z.string().default('test-secret-test-secret-test-secret')
    : z.string().min(32, 'JWT_SECRET deve ter ao menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  BCRYPT_ROUNDS: z.coerce
    .number()
    .int()
    .min(4)
    .max(15)
    .default(isTest ? 4 : 12),
  MEDIA_APROVACAO: z.coerce.number().min(0).max(10).default(6),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  parsed.error.issues.forEach((i) => console.error(`   - ${i.path.join('.')}: ${i.message}`));
  process.exit(1);
}

module.exports = parsed.data;
