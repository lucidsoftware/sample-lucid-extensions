import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { OAuth2TokenService } from 'src/oauth2/oauth2token.service';
import { ApiService } from './api.service';
import { RawProfile } from './model/profile.model';
import { AppConfig } from 'src/configuration/app.config';

@Controller('api')
export class ApiController {
  constructor(
    private readonly oauth2TokenService: OAuth2TokenService,
    private readonly apiService: ApiService,
    private readonly config: AppConfig,
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

  @Get('/directEmbed')
  async getDirectEmbed(@Query('documentLink') link: string | undefined) {
    if (!link) {
      throw new BadRequestException({
        code: 'BadRequest',
        error: 'Missing Lucid document link in the request',
      });
    }
    const lucidDirectEmbedUrl = `${this.config.lucidUrl}/embeds/link?document=${link}&clientId=${this.config.clientId}`;
    return { link: lucidDirectEmbedUrl };
  }
}
