import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserProfile } from "../profile/user-profile.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserProfile)
        private userRepository: Repository<UserProfile>,
        private configService: ConfigService
        ) {
        super ({
            secretOrKey: 'plzsaveus',//process.env.JWT_SECRET || configService.get<string>('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload) {
        
        // 나는 jwt db를 유지할거야.
        // 그래서 validate를 통해 db에 있는지 확인하고
        // 있으면 그걸 return 해주고
        // 없으면 UnauthorizedException을 던져줄거야.

        

        
        console.log('[jwtstrategy] validate start: ', payload);
        const { userId } = payload
        if (0 < userId)
        {
            console.log('[jwtstrategy] validate: ', userId);
        }
        
        return userId;
        // const user: UserProfile = await this.userRepository.findOne({where: {id: userId}});
        // if (!user) // 아니 ㅅㅂ ㅋㅋ 처음온 얘한테 이런걸 시키면 당연히 없지 저장하기 전인데
        // {    
        //     throw new UnauthorizedException();
        // }
        // return user;
    } 
}