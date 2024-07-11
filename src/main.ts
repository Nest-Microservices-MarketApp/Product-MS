import { NestFactory } from '@nestjs/core';
import { INestMicroservice, Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config';

async function configureMiddleware(app: INestMicroservice) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

async function bootstrap() {
  const logger = new Logger('MS Products - Bootstrap');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port,
      },
    },
  );

  await configureMiddleware(app);

  await app.listen();
  logger.log(`Products Microservice running on http://localhost:${envs.port}`);
}
bootstrap();
