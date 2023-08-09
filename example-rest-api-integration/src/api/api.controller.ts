import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OAuth2TokenService } from 'src/oauth2/oauth2token.service';
import { ApiService } from './api.service';
import { RawProfile } from './model/profile.model';

@Controller('api')
export class ApiController {
  constructor(
    private readonly oauth2TokenService: OAuth2TokenService,
    private readonly apiService: ApiService,
  ) {}

  @Get('/profile')
  async getProfile(
    @Res({ passthrough: true }) res: Response,
  ): Promise<RawProfile> {
    const username = res.locals.username;
    const validAccessToken = await this.oauth2TokenService.getValidTokenForUser(
      username,
    );

    if (!validAccessToken) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const profile = await this.apiService.getProfile(validAccessToken);

    return profile.toRaw();
  }
}
