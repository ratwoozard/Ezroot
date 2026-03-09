import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto);
    return {
      user_id: user.user_id,
      org_id: user.org_id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const { access_token, user } = await this.auth.login(dto);
    return {
      access_token,
      user: {
        user_id: user.user_id,
        org_id: user.org_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
