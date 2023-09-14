import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(  
      private configService: ConfigService
  ) {  
      super ({  
          secretOrKey: 'plzsaveus',//proc  ess.env.JWT_SECRET || configService.get<string>('JWT_SECRET'),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      })
  }
  async validate(payload) {
      return { userId: payload['userId'] };
  }   
}