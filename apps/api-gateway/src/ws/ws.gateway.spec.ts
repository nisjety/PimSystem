import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketGateway } from './ws.gateway';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;

  const mockSocket = {
    id: 'test-socket-id',
    join: jest.fn(),
    disconnect: jest.fn(),
  } as unknown as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSocketGateway],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
    gateway.server = {
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await gateway.handleConnection(mockSocket);
      expect(consoleSpy).toHaveBeenCalledWith('Client connected:', mockSocket.id);
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection error');
      jest.spyOn(console, 'log').mockImplementationOnce(() => {
        throw error;
      });
      
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      gateway.handleDisconnect(mockSocket);
      expect(consoleSpy).toHaveBeenCalledWith('Client disconnected:', mockSocket.id);
    });
  });

  describe('handleLiveSearch', () => {
    it('should emit search results', async () => {
      const payload = { query: 'test', filters: {} };
      await gateway.handleLiveSearch(mockSocket, payload);
      expect(gateway.server.emit).toHaveBeenCalledWith('search:results', { results: [] });
    });

    it('should throw WsException on error', async () => {
      const payload = { query: 'test', filters: {} };
      jest.spyOn(gateway.server, 'emit').mockImplementationOnce(() => {
        throw new Error('Search failed');
      });
      
      await expect(gateway.handleLiveSearch(mockSocket, payload)).rejects.toThrow(WsException);
    });
  });

  describe('handleStockUpdate', () => {
    it('should emit stock update', async () => {
      const payload = { productId: '123', quantity: 10 };
      await gateway.handleStockUpdate(mockSocket, payload);
      expect(gateway.server.emit).toHaveBeenCalledWith('stock:updated', payload);
    });

    it('should throw WsException on error', async () => {
      const payload = { productId: '123', quantity: 10 };
      jest.spyOn(gateway.server, 'emit').mockImplementationOnce(() => {
        throw new Error('Update failed');
      });
      
      await expect(gateway.handleStockUpdate(mockSocket, payload)).rejects.toThrow(WsException);
    });
  });

  describe('handleNotificationSubscription', () => {
    it('should join notification room', async () => {
      const payload = { userId: '123', notificationTypes: ['order', 'stock'] };
      await gateway.handleNotificationSubscription(mockSocket, payload);
      
      expect(mockSocket.join).toHaveBeenCalledWith('notifications:123');
      expect(mockSocket.join).toHaveBeenCalledWith('notifications:123:order');
      expect(mockSocket.join).toHaveBeenCalledWith('notifications:123:stock');
    });

    it('should throw WsException on error', async () => {
      const payload = { userId: '123' };
      jest.spyOn(mockSocket, 'join').mockImplementationOnce(() => {
        throw new Error('Subscription failed');
      });
      
      await expect(gateway.handleNotificationSubscription(mockSocket, payload)).rejects.toThrow(WsException);
    });
  });
}); 