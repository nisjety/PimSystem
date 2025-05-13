import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { Request } from 'express';

/**
 * Guard that verifies Clerk authentication tokens.
 * Extracts the Bearer token from the Authorization header and verifies it using Clerk's SDK.
 * On successful verification, adds the verified token data to request.auth.
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Validates the request by verifying the Clerk authentication token.
   * @param context The execution context containing the request
   * @returns true if the token is valid, throws UnauthorizedException otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Use a custom options object that matches what Clerk expects
      const clerkOptions = {
        secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
        authorizedParties: [
          this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
          this.configService.get<string>('MONOLITH_URL', 'http://localhost:3001')
        ]
      };

      // Add issuer if it exists in the config
      const issuer = this.configService.get<string>('CLERK_ISSUER');
      if (issuer) {
        // Using any here to bypass the type checking since the VerifyTokenOptions doesn't include issuer
        (clerkOptions as any).issuer = issuer;
      }

      const verifiedToken = await verifyToken(token, clerkOptions);

      // Add the verified token data to the request object
      (request as any).auth = verifiedToken;
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Extracts the Bearer token from the Authorization header.
   * @param request The Express request object
   * @returns The extracted token or undefined if not found
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}