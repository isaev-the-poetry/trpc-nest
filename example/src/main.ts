import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Включаем CORS для тестирования
  app.enableCors();
  
  // Добавляем глобальный префикс
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📊 Info endpoint: http://localhost:${port}/api`);
  console.log(`🔧 tRPC schema: http://localhost:${port}/api/trpc-schema`);
}

bootstrap(); 