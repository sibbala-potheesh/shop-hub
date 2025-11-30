import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  // This method is called by passport after successful authentication with Google.
  // Return value will be assigned to req.user in controller handlers guarded by AuthGuard('google').
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile?.emails?.[0]?.value;
    const displayName = profile?.displayName;
    const firstName = profile?.name?.givenName;
    const lastName = profile?.name?.familyName;
    const photo = profile?.photos?.[0]?.value;

    const user = {
      provider: 'google',
      providerId: profile.id,
      email,
      displayName,
      firstName,
      lastName,
      photo,
      accessToken,
      refreshToken,
      rawProfile: profile,
    };

    console.log('Google user validated:', user);

    return user;
  }
}
