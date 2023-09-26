import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

const env = new ConfigService();
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(  
  ) {  
      super ({  
          secretOrKey: env.get<string>('JWT_SECRET'),//plzsaveus',//proc  ess.env.JWT_SECRET || configService.get<string>('JWT_SECRET'),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      })
  }
  async validate(payload) {
      return { userId: payload['userId'] };
  }   
}