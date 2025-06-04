import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation } from 'trpc-nest-decorators';
import { z } from 'zod';

// Схемы валидации
const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.number()
});

const GetPostSchema = z.object({
  id: z.number()
});

const UpdatePostSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional()
});

// Интерфейсы
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

@Router({ prefix: 'posts' })
@Injectable()
export class PostsController {
  private posts: Post[] = [
    {
      id: 1,
      title: 'First Post',
      content: 'This is the first post content',
      authorId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      title: 'Second Post',
      content: 'This is the second post content',
      authorId: 2,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  @Query('getAll')
  async getAllPosts(): Promise<Post[]> {
    return this.posts;
  }

  @Query('getById', {
    input: GetPostSchema
  })
  async getPostById(input: { id: number }): Promise<Post | null> {
    const post = this.posts.find(p => p.id === input.id);
    return post || null;
  }

  @Query('getByAuthor', {
    input: z.object({ authorId: z.number() })
  })
  async getPostsByAuthor(input: { authorId: number }): Promise<Post[]> {
    return this.posts.filter(p => p.authorId === input.authorId);
  }

  @Mutation('create', {
    input: CreatePostSchema
  })
  async createPost(input: z.infer<typeof CreatePostSchema>): Promise<Post> {
    const newPost: Post = {
      id: Math.max(...this.posts.map(p => p.id), 0) + 1,
      title: input.title,
      content: input.content,
      authorId: input.authorId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.posts.push(newPost);
    return newPost;
  }

  @Mutation('update', {
    input: UpdatePostSchema
  })
  async updatePost(input: z.infer<typeof UpdatePostSchema>): Promise<Post | null> {
    const postIndex = this.posts.findIndex(p => p.id === input.id);
    
    if (postIndex === -1) {
      return null;
    }
    
    const post = this.posts[postIndex];
    if (input.title) post.title = input.title;
    if (input.content) post.content = input.content;
    post.updatedAt = new Date();
    
    this.posts[postIndex] = post;
    return post;
  }

  @Mutation('delete', {
    input: GetPostSchema
  })
  async deletePost(input: { id: number }): Promise<{ success: boolean }> {
    const index = this.posts.findIndex(p => p.id === input.id);
    
    if (index === -1) {
      return { success: false };
    }
    
    this.posts.splice(index, 1);
    return { success: true };
  }
} 