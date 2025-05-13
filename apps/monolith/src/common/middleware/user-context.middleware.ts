import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface UserContext {
  userId: string;
  orgId: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      userContext: UserContext;
    }
  }
}

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string;
    const orgId = req.headers['x-org-id'] as string;
    const roles = (req.headers['x-user-roles'] as string || '').split(',').filter(Boolean);

    if (!userId || !orgId) {
      return res.status(401).json({ message: 'Missing required headers' });
    }

    req.userContext = {
      userId,
      orgId,
      roles,
    };

    next();
  }
} 