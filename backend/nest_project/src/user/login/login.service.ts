import { Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { User42Dto } from './dto/user42.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from '../profile/user-profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LoginService {
    constructor(private configService : ConfigService,
        @InjectRepository(UserProfile)
        private userProfileRepository: Repository<UserProfile>
        ) {}

    getRedirectUrlTo42Auth() : string {
        const clientID = this.configService.get<string>('CLIENT_ID');
        const baseUrl = this.configService.get<string>('OAUTH_API42');
        const redirectUri = this.configService.get<string>('REDIRECT_URI');
        const scope = this.configService.get<string>('SCOPE');
        return `${baseUrl}?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    }

    async getAccessTokenOf42User(code: string) : Promise<string> {
        try {
            const response: AxiosResponse = await axios.post(this.configService.get<string>('TOKEN_API42'),
                {
                    grant_type: 'authorization_code',
                    client_id: this.configService.get<string>('CLIENT_ID'),
                    client_secret: this.configService.get<string>('CLIENT_SECRET'),
                    code: code,
                    redirect_uri: this.configService.get<string>('REDIRECT_URI')
                }
                );
                return response.data.access_token;
        } catch (error) {
            console.log('error in getAccessTokenOf42User: ', error);
            return null;
        }
    }

    async getUserDataFrom42(accessToken: string) : Promise<any> {
        try {
            const response: AxiosResponse = await axios.get(this.configService.get<string>('API42') + '/v2/me',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            const { id, login, email, first_name, last_name, campus } = response.data;
            const userData: User42Dto = {
              id,
              login,
              email,
              first_name,
              last_name,
              campus: campus[0].name,
            };
            return userData;
        } catch (error) {
            console.log('error in getUserDataFrom42: ', error);
            return null;
        }
    }

    
}
