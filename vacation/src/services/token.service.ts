// src/auth/services/auth-token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/user.entity';
export interface AuthTokenPayload {
  sub: number | string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwt: JwtService) {}

  createForUser(user: UserEntity): string {
    return this.jwt.sign(
      { sub: user.id, role: user.role , email:user.email, name:user.name},
      { expiresIn: '1h', secret:process.env.JWT_SECRET ||'some-secret-123' },
    );
  }
  async validateToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = await this.jwt.verifyAsync<AuthTokenPayload>(token, {
        secret: process.env.JWT_SECRET || 'some-123-key',
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  extractBearerToken(authHeader?:string):string{
    if (!authHeader || !authHeader.startsWith('Bearer ')){
      throw new UnauthorizedException('Missing bearer token');
    }
    return authHeader.substring(7);
  }
}
