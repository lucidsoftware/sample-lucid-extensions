import { Controller, Get, Render, Res } from '@nestjs/common';
import { UserRepository } from './user/user.repository';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get()
  @Render('home')
  home(@Res() res: Response) {
    const username = res.locals.username;
    const tokenInfo = this.userRepository.getTokenForUser(res.locals.username);

    return {
      username,
      connected: !(tokenInfo == null),
      expireDate: tokenInfo?.expires,
    };
  }
}
