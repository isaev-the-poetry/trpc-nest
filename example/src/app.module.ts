import { Module } from '@nestjs/common';
import { TrpcNestModule } from 'trpc-nest-decorators';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    // Подключаем наш пакет
    TrpcNestModule.forRoot(),
    
    // Подключаем модули с контроллерами
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 