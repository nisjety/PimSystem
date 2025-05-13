import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { LiveSearchDto, StockUpdateDto, NotificationSubscriptionDto } from '../dto/websocket.dto';

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      // Here you would validate the client's token
      console.log('Client connected:', client.id);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @UseGuards(ClerkAuthGuard)
  @SubscribeMessage('search:live')
  async handleLiveSearch(client: Socket, payload: LiveSearchDto) {
    try {
      // Handle live search logic
      const results = await this.performSearch(payload.query, payload.filters);
      this.server.emit('search:results', { results });
    } catch (error) {
      throw new WsException('Search failed');
    }
  }

  @UseGuards(ClerkAuthGuard)
  @SubscribeMessage('stock:update')
  async handleStockUpdate(client: Socket, payload: StockUpdateDto) {
    try {
      // Handle stock update logic
      await this.updateStock(payload);
      this.server.emit('stock:updated', payload);
    } catch (error) {
      throw new WsException('Stock update failed');
    }
  }

  @UseGuards(ClerkAuthGuard)
  @SubscribeMessage('notifications:subscribe')
  async handleNotificationSubscription(client: Socket, payload: NotificationSubscriptionDto) {
    try {
      // Handle notification subscription logic
      const room = `notifications:${payload.userId}`;
      client.join(room);
      
      if (payload.notificationTypes?.length) {
        payload.notificationTypes.forEach(type => {
          client.join(`${room}:${type}`);
        });
      }
    } catch (error) {
      throw new WsException('Subscription failed');
    }
  }

  private async performSearch(query: string, filters?: Record<string, any>) {
    // Implement search logic here
    return [];
  }

  private async updateStock(update: StockUpdateDto) {
    // Implement stock update logic here
  }
} 