import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto, RefreshDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserData } from './types/auth-jwtPayload';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.authService.registerUser(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @ApiBody({ type: LoginDto })
  signin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @ApiBody({ type: RefreshDto })
  refresh(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @ApiBearerAuth()
  @Post('signout')
  signout(@CurrentUser('id') userId: number) {
    return this.authService.signOut(userId);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: CurrentUserData) {
    return user;
  }
}
