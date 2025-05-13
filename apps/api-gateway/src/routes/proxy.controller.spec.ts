import { Test, TestingModule } from '@nestjs/testing';
import { MonolithController } from '../controllers/monolith.controller';
import { ProxyService } from '../proxy/proxy.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('MonolithController', () => {
  let controller: MonolithController;
  let proxyService: ProxyService;
  let authService: AuthService;

  const mockRequest = {
    method: 'GET',
    path: '/api/test',
    headers: {
      authorization: 'Bearer mock_token',
    },
    body: {},
  } as any;

  const mockProxyService = {
    forwardRequest: jest.fn(),
  };

  const mockAuthService = {
    validateToken: jest.fn().mockResolvedValue({ userId: 'test_user' }),
    extractTokenFromHeader: jest.fn().mockReturnValue('mock_token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock_clerk_secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonolithController],
      providers: [
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: {
            request: jest.fn().mockImplementation(() =>
              of({
                status: 200,
                data: { message: 'Success' },
                headers: {},
              }),
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<MonolithController>(MonolithController);
    proxyService = module.get<ProxyService>(ProxyService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should forward the request to the proxy service', async () => {
      const expectedResponse = { 
        status: 200,
        data: { message: 'Success' },
        headers: {}
      };
      mockProxyService.forwardRequest.mockResolvedValue(expectedResponse);

      const result = await controller.handleRequest(mockRequest);

      expect(proxyService.forwardRequest).toHaveBeenCalledWith(
        'monolith',
        mockRequest.method,
        '/test', // path with /api stripped
        mockRequest.headers,
        mockRequest.body
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle errors from the proxy service', async () => {
      const error = new Error('Proxy error');
      mockProxyService.forwardRequest.mockRejectedValue(error);

      await expect(controller.handleRequest(mockRequest)).rejects.toThrow(error);
    });
  });
}); 