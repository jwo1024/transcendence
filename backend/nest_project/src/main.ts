// import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe());

  //  const configService = app.get(ConfigService);
  // CORS 설정
  app.enableCors({
    origin: `${process.env.FRONTEND_URL}`, //'http://localhost:3001',//allowedOrigins,//configService.get<string>('FRONTEND_URL'), //    '', // 프론트엔드 주소로 변경
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS',
    credentials: true,
  });

  await app.listen(4000);
}
bootstrap();
