import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './notification/middleware/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('Notification Microservice API')
    .setVersion('1.0')
    .build();

  const document =
    SwaggerModule.createDocument(app, new DocumentBuilder()
      .setTitle('Notification Service')
      .setDescription('Notification Microservice API')
      .setVersion('1.0')
      .build());

  SwaggerModule.setup(
    'api',
    app,
    document
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
