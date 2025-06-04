import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersController],
  exports: [UsersController]
})
export class UsersModule {} 