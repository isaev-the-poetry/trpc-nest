import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';

@Module({
  providers: [PostsController],
  exports: [PostsController]
})
export class PostsModule {} 