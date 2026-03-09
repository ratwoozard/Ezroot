import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

// Stier til .env: repo-root først (fra dist: __dirname = apps/api/dist → ../../../ = root), så cwd
const rootEnv = path.resolve(__dirname, '../../../.env');
const candidates = [
  rootEnv,
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) config({ path: p });
}
// Læs altid DATABASE_URL fra repo-root .env så system-miljø ikke overskriver (fx direct URL)
if (fs.existsSync(rootEnv)) {
  const raw = fs.readFileSync(rootEnv, 'utf8').replace(/\r\n/g, '\n');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (key === 'DATABASE_URL' || key === 'JWT_SECRET') process.env[key] = val;
  }
}
// Fallback: læs .env manuelt hvis stadig mangler (DATABASE_URL kun fra root)
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const raw = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (key === 'DATABASE_URL' && p !== rootEnv) continue;
      if (key && /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) process.env[key] = val;
    }
    if (process.env.DATABASE_URL && process.env.JWT_SECRET) break;
  }
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ErrorResponseFilter } from './common/error-response.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true }); // allow browser (e.g. localhost:3000/3002) to call API
  app.useGlobalFilters(new ErrorResponseFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = process.env.API_PORT || process.env.PORT || 3001;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
