import { ApiProperty } from '@nestjs/swagger';

export enum LifecycleEventType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  VIEWED = 'VIEWED',
  EXPORTED = 'EXPORTED',
}

export interface LifecycleEvent {
  id: string;
  entityId: string;
  entityType: string; // 'PRODUCT', 'CATEGORY', 'INGREDIENT', etc.
  userId: string;
  eventType: LifecycleEventType;
  metadata?: Record<string, any>; // Additional data related to the event
  createdAt: Date;
  
  // Relations
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  
  user?: {
    id: string;
    name: string;
  };
}
