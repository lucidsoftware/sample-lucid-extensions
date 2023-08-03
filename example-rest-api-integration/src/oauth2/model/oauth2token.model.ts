/**
 * The OAuth2 Token resource as described in: https://developer.lucid.co/rest-api/v1/#oauth2-resources
 */
export interface RawOAuth2Token {
  access_token: string;
  refresh_token: string;
  user_id: number;
  client_id: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export class OAuth2Token {
  public readonly accessToken: string;
  public readonly refreshToken: string | undefined;
  public readonly userId: number;
  public readonly clientId: string;
  public readonly scope: string;
  public readonly tokenType: string;

  /** Will help us determine if the token needs to be refreshed */
  public readonly expires: Date;

  constructor(rawToken: RawOAuth2Token) {
    this.accessToken = rawToken.access_token;
    this.refreshToken = rawToken.refresh_token;
    this.userId = rawToken.user_id;
    this.clientId = rawToken.client_id;
    this.scope = rawToken.scope;
    this.tokenType = rawToken.token_type;
    this.expires = this.computeExpires(rawToken.expires_in);
  }

  /**
   * Computes the date when the token will expire using the `expires_in` field on the OAuth2 token response. `expires_in` represents seconds.
   * @param expiresIn
   * @returns
   */
  private computeExpires(expiresIn: number): Date {
    const now = new Date();
    const expiresMillis = now.getTime() + expiresIn * 1000;
    return new Date(expiresMillis);
  }
}
