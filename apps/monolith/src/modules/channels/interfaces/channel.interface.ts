export enum ChannelType {
  ECOMMERCE = 'ecommerce',
  MARKETPLACE = 'marketplace',
  POS = 'pos',
  SOCIAL = 'social',
  OTHER = 'other',
}

export interface Channel {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: ChannelType;
  config?: Record<string, any>;
  isActive: boolean;
  products?: any[]; // Consider creating a proper Product interface
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
} 