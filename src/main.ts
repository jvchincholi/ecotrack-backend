import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('EcoTrack Backend API')
    .setDescription('Authentication and User Management API for EcoTrack - Carbon Footprint Tracking')
    .setVersion('1.0.0')
    .addTag('Health', 'System health checks')
    .addTag('Auth', 'Authentication endpoints - register, login, token management')
    .addTag('Users', 'User management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
  console.log('Swagger documentation available at: http://localhost:3001/api/docs');
}
bootstrap();