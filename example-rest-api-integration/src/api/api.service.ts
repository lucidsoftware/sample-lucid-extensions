import { AppConfig } from 'src/configuration/app.config';
import { Injectable } from '@nestjs/common';
import { Profile } from './model/profile.model';
import axios from 'axios';

interface LucidHeaders {
  'Lucid-Api-Version': string;
  Authorization: string;
}

@Injectable()
export class ApiService {
  constructor(private readonly config: AppConfig) {}

  /**
   * This method performs the Get Profile request as described in https://developer.lucid.co/rest-api/v1/#get-profile
   * @param accessToken a valid OAuth2 access token
   * @returns the profile information
   */
  async getProfile(accessToken: string): Promise<Profile> {
    const response = await axios.get(
      this.config.lucidApiUrl + '/users/me/profile',
      {
        headers: { ...this.getLucidHeaders(accessToken) },
      },
    );

    if (response.status !== 200) {
      throw Error(
        `Failed to retrieve user profile, got ${response.status} ${response.statusText}: ${response.data}`,
      );
    }

    return new Profile(response.data);
  }

  private getLucidHeaders(accessToken: string): LucidHeaders {
    return {
      'Lucid-Api-Version': this.config.apiVersion,
      Authorization: `Bearer ${accessToken}`,
    };
  }
}
