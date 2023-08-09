import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const username = req.cookies.username;

    if (!username) {
      if (req.accepts('text/html')) {
        res.redirect('/login');
      } else {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .send({ code: 'Unauthorized', message: 'You need to log in first' });
      }
    } else {
      res.locals.username = username;
      next();
    }
  }
}
