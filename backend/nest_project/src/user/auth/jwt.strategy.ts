import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
      super ({  
          secretOrKey: configService.get<string>('JWT_SECRET'),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      })
    }
  async validate(payload) {
      return { userId: payload['userId'] };
  }   
}