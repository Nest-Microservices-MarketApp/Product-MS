import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { envs } from './config';
// import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port,
      },
    },
  );

  // const config = new DocumentBuilder()
  //   .addBearerAuth()
  //   .setTitle('ProductsMicroservice')
  //   .setDescription('The products API description')
  //   .setVersion('1.0')
  //   .addTag('products')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);

  // SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // app.use(json({ limit: '50mb' }));

  // app.use(urlencoded({ extended: true, limit: '50mb' }));

  // app.setGlobalPrefix('api');

  // app.enableCors({
  //   origin: '*',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   preflightContinue: false,
  //   optionsSuccessStatus: 204,
  //   credentials: false,
  //   allowedHeaders: 'Content-Type, Authorization',
  // });

  await app.listen();
  logger.log(`Products Microservice running on http://localhost:${envs.port}`);
  // logger.log(`Swagger running on http://localhost:${envs.port}/api/docs`);
}
bootstrap();
