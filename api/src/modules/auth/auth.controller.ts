import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  BadRequestException,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { first } from 'rxjs';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async register(@Body() dto: CreateUserDto) {
    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const user = await this.usersService.create(dto, salt);
    const { password, ...safe } = user as any;
    return safe;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and get JWT' })
  @ApiResponse({ status: 200, description: 'Returns access token' })
  async login(@Body() dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('Invalid credentials');
    const valid = await this.authService.validateUser(dto.email, dto.password);
    if (!valid) throw new BadRequestException('Invalid credentials');
    const token = await this.authService.login(user);
    const userObj: any = (user as any).toJSON
      ? (user as any).toJSON()
      : { ...user };
    delete userObj.password;
    userObj.id = userObj._id ? userObj._id.toString() : userObj.id;
    return { token, user: userObj };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get profile for authenticated user' })
  async profile(@Request() req: any) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    const { password, ...safe } = user as any;
    return safe;
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Post('google/callback')
  @UseGuards(AuthGuard('google-token'))
  @ApiOperation({ summary: 'Verify Google ID token and authenticate user' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  @ApiResponse({
    status: 401,
    description: 'Invalid token or authentication failed',
  })
  @HttpCode(HttpStatus.OK)
  async googleTokenAuth(@Req() req: any) {
    return this.authService.googleLogin(req.user);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  async googleAuthRedirect(@Request() req: any, @Res() res: Response) {
    const gUser = req.user as any;
    if (!gUser || !gUser.emails || !gUser.emails.length) {
      throw new BadRequestException('No email found from Google account');
    }

    const email = gUser.emails[0].value;
    let user = await this.usersService.findByEmail(email);

    console.log('Google OAuth2 callback user email:', user);

    if (!user) {
      const dto: CreateUserDto = {
        email,
        firstName: gUser.displayName || gUser.name?.givenName || 'Google User',
        password: Math.random().toString(36).slice(-8),
      } as any;
      const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      user = await this.usersService.create(dto, salt);
    }

    const token = await this.authService.login(user);

    const rawUser: any =
      typeof (user as any).toJSON === 'function'
        ? (user as any).toJSON()
        : user && (user as any)._doc
        ? (user as any)._doc
        : { ...(user as any) };

    delete rawUser.password;
    delete rawUser.__v;
    delete rawUser.$__;
    delete rawUser.$isNew;
    delete rawUser.__t;

    const id = rawUser._id ? String(rawUser._id) : rawUser.id ?? undefined;
    rawUser.id = id;
    delete rawUser._id;

    const accessToken =
      token && typeof token === 'object' && token.access_token
        ? token.access_token
        : typeof token === 'string'
        ? token
        : token?.access_token ?? null;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return res.redirect(
      `${frontendUrl}/auth/success?token=${encodeURIComponent(
        accessToken,
      )}&userId=${encodeURIComponent(rawUser.id ?? '')}`,
    );
  }
}
