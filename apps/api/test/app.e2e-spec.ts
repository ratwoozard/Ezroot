/**
 * E2E: Start app and run auth + tenant-scoped endpoint tests.
 * Requires: DATABASE_URL, JWT_SECRET, migrations applied.
 * Run: pnpm -C apps/api test
 */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ErrorResponseFilter } from '../src/common/error-response.filter';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ErrorResponseFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth', () => {
    it('register -> login -> me', async () => {
      const email = `test-${Date.now()}@example.com`;
      const reg = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
          orgName: 'Test Org',
        })
        .expect(201);
      expect(reg.body).toHaveProperty('user_id');
      expect(reg.body.email).toBe(email);

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password123' })
        .expect(200);
      expect(login.body).toHaveProperty('access_token');
      expect(login.body.user?.email).toBe(email);

      const token = login.body.access_token;
      const me = await request(app.getHttpServer())
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(me.body.email).toBe(email);
    });
  });

  describe('tenant-scoped endpoint', () => {
    it('GET /vehicle-profiles with JWT returns list', async () => {
      const email = `prof-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'pass12345', name: 'P', orgName: 'O' })
        .expect(201);
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'pass12345' })
        .expect(200);
      const token = login.body.access_token;

      const res = await request(app.getHttpServer())
        .get('/vehicle-profiles?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('totalCount');
      expect(Array.isArray(res.body.items)).toBe(true);
    });
  });
});
