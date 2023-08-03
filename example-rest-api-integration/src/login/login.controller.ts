import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Res,
} from '@nestjs/common';
import { clearCookie, setSecureCookie } from 'src/util/cookieshelper';
import { LoginData } from './login.data';
import { UserRepository } from 'src/user/user.repository';
import { Response } from 'express';

@Controller('')
export class LoginController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('/login')
  @Render('login')
  login(@Res({ passthrough: false }) res: Response) {
    const tokenInfo = this.userRepository.getTokenForUser(res.locals.username);

    return { connected: !(tokenInfo == null), expireDate: tokenInfo?.expires };
  }

  @Post('/login')
  @Redirect('/')
  loginSubmit(
    @Res({ passthrough: true }) res: Response,
    @Body() data: LoginData,
  ): void {
    if (data.username) {
      setSecureCookie(res, 'username', data.username);
    }
  }

  @Post('/logout')
  @Redirect('/')
  logoutSubmit(@Res({ passthrough: true }) res: Response): void {
    clearCookie(res, 'username');
  }
}
