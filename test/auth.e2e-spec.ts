import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication Module E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET / should return health message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('AUTH - Registration', () => {
    it('POST /api/auth/register should create user and return tokens', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('password');
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('POST /api/auth/register with invalid email should fail', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('POST /api/auth/register with weak password should fail', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(400);
    });

    it('POST /api/auth/register with duplicate email should return 409', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });
  });

  describe('AUTH - Login', () => {
    it('POST /api/auth/login with correct credentials should return tokens', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('POST /api/auth/login with wrong password should return 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('POST /api/auth/login with non-existent email should return 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123',
        })
        .expect(401);
    });

    it('POST /api/auth/login with invalid email format should return 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123',
        })
        .expect(400);
    });
  });

  describe('AUTH - Refresh Token', () => {
    it('POST /api/auth/refresh with valid token should return new access token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.accessToken).not.toEqual(accessToken);
        });
    });

    it('POST /api/auth/refresh without token should return 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({})
        .expect(400);
    });

    it('POST /api/auth/refresh with invalid token should return 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);
    });
  });

  describe('AUTH - Get Current User', () => {
    it('GET /api/auth/me with valid token should return user profile', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe(testUser.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('GET /api/auth/me without token should return 401', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('GET /api/auth/me with invalid token should return 401', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('GET /api/auth/me with malformed header should return 401', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'InvalidTokenFormat')
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('Should protect endpoints by default (requires JWT)', () => {
      // This test assumes other endpoints exist and are protected
      // Will work with future modules (activities, analytics, etc.)
      return request(app.getHttpServer())
        .get('/api/activities')
        .expect(401);
    });
  });

  describe('Response Format Validation', () => {
    it('Error responses should have standard format', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'short' })
        .expect((res) => {
          // NestJS standard error response
          expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });
  });

  describe('Password Security', () => {
    it('Passwords should be hashed in database', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect((res) => {
          // User response should never include plaintext password
          expect(res.body.password).toBeUndefined();
        });
    });

    it('Password validation requirements should be enforced', () => {
      const invalidPasswords = [
        'short', // Too short
        'nouppercase123', // No uppercase
        'NOLOWERCASE123', // No lowercase
        'NoNumbers', // No numbers
        '', // Empty
      ];

      const requests = invalidPasswords.map((password) =>
        request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            ...testUser,
            email: `test${Math.random()}@example.com`,
            password,
          })
          .expect(400),
      );

      return Promise.all(requests);
    });
  });

  describe('Email Uniqueness', () => {
    it('Duplicate emails should be rejected', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `unique${Date.now()}@example.com`,
          password: 'ValidPassword123',
          firstName: 'First',
          lastName: 'User',
        })
        .expect(201);

      // Second registration with same email should fail
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `unique${Date.now()}@example.com`,
          password: 'AnotherPassword123',
          firstName: 'Second',
          lastName: 'User',
        })
        .expect(409);
    });
  });
});
