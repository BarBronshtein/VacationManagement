import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from './pipes/zod-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin:'http://localhost:5173',
    methods:['GET','PUT','POST','DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
