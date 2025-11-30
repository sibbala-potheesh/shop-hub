import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return false;
    const hashed = user.password;
    const isMatch = await bcrypt.compare(pass, hashed);
    if (!isMatch) return false;
    return user;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id ? user._id.toString() : user.id,
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token, expires_in: process.env.JWT_EXPIRES_IN || '1h' };
  }

  async googleLogin(googleUser: any) {
    if (!googleUser || !googleUser.email) {
      throw new UnauthorizedException('Invalid Google user data');
    }
    let user = await this.usersService.findByEmail(googleUser.email);
    if (!user) {
      const dto: CreateUserDto = {
        email: googleUser.email,
        name:
          googleUser.displayName ||
          `${googleUser.firstName || ''} ${googleUser.lastName || ''}`.trim(),
        password: Math.random().toString(36).slice(-10),
      } as any;
      const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      user = await this.usersService.create(dto, salt);
    }
    const token = await this.login(user);
    const userObj: any = { ...user };
    delete userObj.password;
    userObj.id = userObj._id?.toString() ?? userObj.id;
    return { token, user: userObj };
  }
}
