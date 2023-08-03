import { BadGatewayException, Injectable } from '@nestjs/common';
import { OAuth2Token, RawOAuth2Token } from './model/oauth2token.model';
import axios from 'axios';
import { AppConfig } from 'src/configuration/app.config';

@Injectable()
export class OAuth2Service {
  private readonly oauth2TokenUrl: string;

  constructor(private readonly config: AppConfig) {
    this.oauth2TokenUrl = config.lucidApiUrl + '/oauth2/token';
  }

  /**
   * It will perform the Create Access Token request as described in https://developer.lucid.co/rest-api/v1/#create-access-token
   * @param code the OAuth 2.0 code we got from the authorization request
   * @returns the parsed OAuth 2.0 token
   */
  async authorizationCodeGrant(code: string): Promise<OAuth2Token> {
    const data = JSON.stringify({
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await axios.post(this.oauth2TokenUrl, data, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 200) {
      throw new BadGatewayException(
        `Got ${response.status} ${response.statusText} from OAuth 2.0 token endpoint: ${this.oauth2TokenUrl}`,
      );
    }

    return new OAuth2Token(response.data as RawOAuth2Token);
  }

  /**
   * It will perform the Refresh Access Token request as described in https://developer.lucid.co/rest-api/v1/#oauth2-refresh-access-token
   * @param refreshToken the refresh token we obtained in the code grant request
   * @returns the parsed OAuth 2.0 token
   */
  async refreshTokenGrant(refreshToken: string): Promise<OAuth2Token> {
    const data = JSON.stringify({
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
    });

    const response = await axios.post(this.oauth2TokenUrl, data, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 200) {
      throw new BadGatewayException(
        `Got ${response.status} ${response.statusText} from OAuth 2.0 refresh token endpoint: ${response.data}`,
      );
    }

    return new OAuth2Token(response.data as RawOAuth2Token);
  }
}
