// import { Inject, Injectable } from '@nestjs/common';
// import { ConfigType } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Request } from 'express';
// import refreshConfig from '../config/refresh.config';
// import { AuthService } from '../auth.service';
// import type { AuthJwtPayload } from '../types/auth-jwtPayload';

// @Injectable()
// export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
//   constructor(
//     @Inject(refreshConfig.KEY)
//     private refreshTokenConfig: ConfigType<typeof refreshConfig>,
//     private authService: AuthService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
//       secretOrKey: refreshTokenConfig.secret!,
//       ignoreExpiration: false,
//       passReqToCallback: true,
//     });
//   }

//   validate(req: Request, payload: AuthJwtPayload) {
//     const refreshToken = req.body.refreshToken;
//     return this.authService.validateRefreshToken(payload.sub, refreshToken);
//   }
// }
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FastifyRequest } from 'fastify';
import refreshConfig from '../config/refresh.config';
import { AuthService } from '../auth.service';
import type { AuthJwtPayload } from '../types/auth-jwtPayload';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: refreshTokenConfig.secret!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: AuthJwtPayload) {
    const refreshToken = (req.body as { refreshToken: string }).refreshToken;
    return this.authService.validateRefreshToken(payload.sub, refreshToken);
  }
}