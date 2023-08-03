import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AccessMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.on('close', () => {
      const now = new Date();
      console.log(
        `${now.toISOString()} ${req.method} ${req.url} ${res.statusCode}`,
      );
    });

    next();
  }
}
