import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve, join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonLogger } from './common/logger/winston-logger.service';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RolesGuard } from './common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });

  const winstonLogger = app.get(WinstonLogger);
  app.useLogger(winstonLogger);
  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalInterceptors(new ErrorInterceptor(winstonLogger));
  app.useGlobalInterceptors(new LoggingInterceptor(winstonLogger));
  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

  try {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      ignoreGlobalPrefix: false,
    });

    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger initialized at /api/docs');
  } catch (err) {
    logger.error('Swagger generation failed:', (err as Error).message);
    logger.debug((err as Error).stack || '');
  }

  const publicPath = resolve(process.env.ROOT_LOCATION || '', '.', 'public');
  app.useStaticAssets(publicPath);
  console.log(`Serving static assets from: ${publicPath}`);
  console.log(process.env.ROOT_LOCATION);
  logger.log(`Serving static assets from: ${publicPath}`);

  app
    .getHttpAdapter()
    .getInstance()
    .get('*', (req: Request, res: Response, next: NextFunction) => {
      const url = req.url;
      if (
        url.startsWith('/api') ||
        url.startsWith('/static') ||
        url.startsWith('/static-images') ||
        url.startsWith('/static-profile') ||
        url.startsWith('/uploads')
      ) {
        return next();
      }
      res.sendFile(join(publicPath, 'index.html'));
    });

  await app.init();
  logger.log('App initialized');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  winstonLogger.log(`Application listening on port ${port}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  console.error('Bootstrap fatal error', err);
  process.exit(1);
});
