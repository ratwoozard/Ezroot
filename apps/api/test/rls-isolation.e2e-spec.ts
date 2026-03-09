/**
 * E2E: RLS isolation – org B cannot read org A's data.
 * Requires: DATABASE_URL, JWT_SECRET, migrations applied.
 */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ErrorResponseFilter } from '../src/common/error-response.filter';

describe('RLS isolation (e2e)', () => {
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

  it('org B cannot see org A vehicle_profiles or get by A id', async () => {
    const ts = Date.now();
    const emailA = `rls-a-${ts}@example.com`;
    const emailB = `rls-b-${ts}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: emailA, password: 'pass12345', name: 'A', orgName: 'Org RLS A' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: emailB, password: 'pass12345', name: 'B', orgName: 'Org RLS B' })
      .expect(201);

    const loginA = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailA, password: 'pass12345' })
      .expect(200);
    const loginB = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailB, password: 'pass12345' })
      .expect(200);

    const tokenA = loginA.body.access_token;
    const tokenB = loginB.body.access_token;

    const createRes = await request(app.getHttpServer())
      .post('/vehicle-profiles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Only A profile',
        length: 5,
        width: 2,
        height: 2,
        weight: 3000,
        axles: 2,
        hazardous_material: false,
      })
      .expect(201);
    const vehicleIdA = createRes.body.vehicle_id;
    expect(vehicleIdA).toBeDefined();

    const listB = await request(app.getHttpServer())
      .get('/vehicle-profiles?page=1&limit=100')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(listB.body.items).toEqual([]);
    expect(listB.body.totalCount).toBe(0);

    await request(app.getHttpServer())
      .get(`/vehicle-profiles/${vehicleIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });
});
