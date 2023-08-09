/**
 * The Profile resource as described in https://developer.lucid.co/rest-api/v1/#users-resources-user
 */
export interface RawProfile {
  email: string;
  fullName: string;
  id: number;
  username: string;
}

export class Profile {
  private readonly email: string;
  private readonly fullName: string;
  private readonly id: number;
  private readonly username: string;

  constructor(raw: RawProfile) {
    this.email = raw.email;
    this.fullName = raw.fullName;
    this.id = raw.id;
    this.username = raw.username;
  }

  toRaw(): RawProfile {
    return {
      email: this.email,
      fullName: this.fullName,
      id: this.id,
      username: this.username,
    };
  }
}
