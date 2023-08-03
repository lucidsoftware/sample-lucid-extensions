import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
  public readonly port: number;
  public readonly clientId: string;
  public readonly clientSecret: string;
  public readonly lucidUrl: string;
  public readonly lucidApiUrl: string;
  public readonly apiVersion: string;
  public readonly scopes: string;
  public readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.port = this.getConfig<number>('PORT', 4000);
    this.clientId = this.getConfig<string>('CLIENT_ID');
    this.clientSecret = this.getConfig<string>('CLIENT_SECRET');
    this.lucidUrl = this.getConfig<string>('LUCID_URL', 'https://lucid.app');
    this.lucidApiUrl = this.getConfig<string>(
      'LUCID_API_URL',
      'https://api.lucid.co',
    );
    this.apiVersion = this.getConfig<string>('API_VERSION', '1');
    this.scopes = 'user.profile offline_access';
    this.redirectUri = `http://localhost:${this.port}/oauth2/redirect`;
  }

  private getConfig<T>(name: string, defaultValue?: T): T {
    const value = this.configService.get<T>(name);

    if (!value) {
      if (!defaultValue) {
        throw Error('Missing config value: ' + name);
      } else {
        return defaultValue;
      }
    }

    return value;
  }
}
