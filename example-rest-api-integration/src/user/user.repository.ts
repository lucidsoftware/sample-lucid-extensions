import { Injectable } from '@nestjs/common';
import { OAuth2Token } from '../oauth2/model/oauth2token.model';

@Injectable()
export class UserRepository {
  private readonly usersTokensMap = new Map<string, OAuth2Token>();

  public setTokenForUser(username: string, token: OAuth2Token) {
    this.usersTokensMap.set(username, token);
  }

  public getTokenForUser(username: string): OAuth2Token | undefined {
    return this.usersTokensMap.get(username);
  }
}
