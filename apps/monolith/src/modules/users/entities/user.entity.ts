import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum representing the various user roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  API_CLIENT = 'api_client'
}

/**
 * User entity interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  clerkId?: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
