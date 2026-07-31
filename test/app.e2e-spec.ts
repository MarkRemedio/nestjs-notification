import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/notification/middleware/http-exception.filter';

describe('NotificationController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let notificationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    server = app.getHttpServer();

    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const response = await request(server)
      .post('/notification')
      .send({
        type: 'EMAIL',
        recipient: 'e2e@example.com',
        message: 'E2E scheduled notification',
        subject: 'E2E test',
        scheduledAt,
      })
      .expect(201);

    notificationId = response.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the saved notification by id', async () => {
    const response = await request(server)
      .get(`/notification/${notificationId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: notificationId,
      recipient: 'e2e@example.com',
      type: 'EMAIL',
      message: 'E2E scheduled notification',
      subject: 'E2E test',
      status: 'PENDING',
    });
  });

  it('returns paginated notifications', async () => {
    const response = await request(server)
      .get('/notification')
      .query({ page: 1, limit: 100 })
      .expect(200);

    expect(response.body.meta).toMatchObject({
      currentPage: 1,
      itemsPerPage: 100,
    });
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.some((item: any) => item.id === notificationId)).toBe(true);
  });

  it('returns notifications filtered by type', async () => {
    const response = await request(server)
      .get('/notification/type/EMAIL')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.every((item: any) => item.type === 'EMAIL')).toBe(true);
  });

  it('cancels the scheduled notification and can query by cancelled status', async () => {
    const cancelResponse = await request(server)
      .patch(`/notification/cancel/${notificationId}`)
      .expect(200);

    expect(cancelResponse.body).toMatchObject({
      id: notificationId,
      status: 'CANCELLED',
    });

    const getByIdResponse = await request(server)
      .get(`/notification/${notificationId}`)
      .expect(200);

    expect(getByIdResponse.body.status).toBe('CANCELLED');

    const statusResponse = await request(server)
      .get('/notification/status/CANCELLED')
      .query({ page: 1, limit: 100 })
      .expect(200);

    expect(Array.isArray(statusResponse.body.data)).toBe(true);
    expect(statusResponse.body.data.every((item: any) => item.status === 'CANCELLED')).toBe(true);
  });
});
