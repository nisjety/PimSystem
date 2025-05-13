import { Channel } from './channel.interface';

export interface PaginatedChannels {
  items: Channel[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 