import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation } from 'trpc-nest-decorators';
import { z } from 'zod';

// Схемы валидации
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional()
});

const GetUserSchema = z.object({
  id: z.number()
});

// Интерфейсы
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 }
  ];

  @Query('getAll')
  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  @Query('getById', {
    input: GetUserSchema
  })
  async getUserById(input: { id: number }): Promise<User | null> {
    const user = this.users.find(u => u.id === input.id);
    return user || null;
  }

  @Mutation('create', {
    input: CreateUserSchema
  })
  async createUser(input: z.infer<typeof CreateUserSchema>): Promise<User> {
    const newUser: User = {
      id: Math.max(...this.users.map(u => u.id), 0) + 1,
      name: input.name,
      email: input.email,
      age: input.age
    };
    
    this.users.push(newUser);
    return newUser;
  }

  @Mutation('delete', {
    input: GetUserSchema
  })
  async deleteUser(input: { id: number }): Promise<{ success: boolean }> {
    const index = this.users.findIndex(u => u.id === input.id);
    
    if (index === -1) {
      return { success: false };
    }
    
    this.users.splice(index, 1);
    return { success: true };
  }

  @Query('search', {
    input: z.object({ query: z.string() })
  })
  async searchUsers(input: { query: string }): Promise<User[]> {
    const query = input.query.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  }
} 