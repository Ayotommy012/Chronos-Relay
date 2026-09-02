import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    server = app.getHttpServer() as Parameters<typeof request>[0];
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    await request(server).get('/').expect(200).expect('Hello World!');
  });
});
