import { Injectable } from '@nestjs/common';
import { OAuth2Token } from './model/oauth2token.model';
import { UserRepository } from '../user/user.repository';
import { OAuth2Service } from './oauth2.service';

@Injectable()
export class OAuth2TokenService {
  // One minute threshold to account avoid failures due to an expired access token
  private static readonly tokenExpirationThreshold = 2 * 60 * 1000;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly lucidOAuth2Service: OAuth2Service,
  ) {}

  /**
   * This method will fetch the given user's OAuth 2.0 token information.
   * If found, it will determine if the token has not expired and is within our lifetime threshold.
   * Otherwise, it will refresh the token, store the new token information and provide the new valid access token.
   * @param username of the app user
   * @returns a valid OAuth 2.0 access token
   */
  async getValidTokenForUser(username: string): Promise<string | undefined> {
    const existingToken = this.userRepository.getTokenForUser(username);

    if (existingToken == null) {
      return undefined;
    }

    if (this.isTokenValid(existingToken)) {
      return existingToken.accessToken;
    }

    if (!existingToken.refreshToken) {
      return undefined;
    }

    const refreshedToken = await this.lucidOAuth2Service.refreshTokenGrant(
      existingToken.refreshToken,
    );

    this.userRepository.setTokenForUser(username, refreshedToken);

    return refreshedToken.accessToken;
  }

  private isTokenValid(token: OAuth2Token): boolean {
    const now = new Date().getTime();
    const expirationTime =
      token.expires.getTime() - OAuth2TokenService.tokenExpirationThreshold;

    return now < expirationTime;
  }
}
