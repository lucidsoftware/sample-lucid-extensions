import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';
import { v4 as uuidV4 } from 'uuid';
import { Response, Request } from 'express';
import { setSecureCookie } from '../util/cookieshelper';
import { UserRepository } from 'src/user/user.repository';
import { AppConfig } from 'src/configuration/app.config';

@Controller('oauth2')
export class OAuth2Controller {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly oauth2Service: OAuth2Service,
    private readonly config: AppConfig,
  ) {}

  /**
   * This method directs the user to the appropiate Lucid authorization URL as described in https://developer.lucid.co/rest-api/v1/#obtaining-an-access-token
   * To prevent CSRF attacks, we use the  Double Submit Cookie technique using the OAuth 2.0 state parameter.
   * For more information look at: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
   */
  @Get('/authorize')
  @Redirect()
  authorize(@Res() res: Response) {
    const state = uuidV4();
    setSecureCookie(res, 'state', state);

    const lucidAuthorizationUrl = `${this.config.lucidUrl}/oauth2/authorize?client_id=${this.config.clientId}&redirect_uri=${this.config.redirectUri}&scopes=${this.config.scopes}&state=${state}`;

    return { url: lucidAuthorizationUrl };
  }

  /**
   * This method receives the OAuth2 authorization code (if the user granted access) and uses it to obtain an OAuth2 token.
   * Then it stores the token associating it with the current logged in user.
   * The Double Submit Cookie is completed by comparing the state query parameter and the cookie state value.
   * If successful, it will load the `handleconnection.hbs` view, which signals succes to the parent window.
   */
  @Get('/redirect')
  @Render('handleconnection')
  async handleRedirect(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
  ) {
    const cookieState = req.cookies.state;

    if (!state || !cookieState || cookieState != state) {
      throw new BadRequestException({
        code: 'BadRequest',
        error: 'OAuth 2.0 state mismatch',
      });
    }
    if (!code) {
      throw new BadGatewayException({
        code: 'BadRequest',
        error: 'Missing OAuth 2.0 authorization code',
      });
    }

    const loggedInUser = res.locals.username;
    const token = await this.oauth2Service.authorizationCodeGrant(
      code as string,
    );

    this.userRepository.setTokenForUser(loggedInUser, token);
  }
}
