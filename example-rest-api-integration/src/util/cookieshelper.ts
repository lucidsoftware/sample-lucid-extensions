import { type Response } from 'express';

export type CookieName = 'username' | 'state';

export const setSecureCookie = (
  res: Response,
  name: CookieName,
  value: string,
): void => {
  res.cookie(name, value, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
};

export const clearCookie = (res: Response, name: CookieName): void => {
  res.clearCookie(name);
};
