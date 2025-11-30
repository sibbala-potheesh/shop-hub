import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleTokenStrategy extends PassportStrategy(
  Strategy,
  'google-token',
) {
  private client: OAuth2Client;
  constructor() {
    super();
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');
  }

  async validate(req: any) {
    const idToken =
      req.body?.idToken || req.headers['x-id-token'] || req.query?.idToken;
    if (!idToken) {
      throw new UnauthorizedException('No ID token provided');
    }
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || '',
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid ID token');
    }
    return {
      provider: 'google',
      providerId: payload['sub'],
      email: payload['email'],
      displayName: payload['name'],
      firstName: payload['given_name'],
      lastName: payload['family_name'],
      photo: payload['picture'],
      rawPayload: payload,
    };
  }
}
