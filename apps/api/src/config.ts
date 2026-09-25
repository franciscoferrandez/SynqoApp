import { z } from 'zod';

const environmentSchema = z.object({
  DATABASE_URL: z.string().url().default('postgresql://synqo:synqo@localhost:5432/synqo'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
});

export type Environment = z.infer<typeof environmentSchema>;

export function getEnvironment(source: NodeJS.ProcessEnv = process.env): Environment {
  return environmentSchema.parse(source);
}
