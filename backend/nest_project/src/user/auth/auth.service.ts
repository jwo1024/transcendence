import { Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { User42Dto } from './dto/user42.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from '../profile/user-profile.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';


import * as fs from 'fs';
import * as path from 'path';


/*
export class SessionService {
  constructor() {
    this.sessions = new Map<number, string>();
  }
  private sessions: Map<number, string>;

  isDifferentSessionId(userId: number, sessionId: string): boolean {
    const currentSessionId: string = this.sessions.get(userId);

    return !(currentSessionId === sessionId);
  }

  setSession(session: any, userId: number) {
    // 유효성 검사 필요
    const sessionId = session.id;

    session.userId = userId;
    //test
    console.log('SessionService session:', session?.id);
    this.sessions.set(userId, sessionId);
  }
}

*/

@Injectable()
export class AuthService {
  constructor(
    //private sessions: Map<number, string>;
    private configService: ConfigService,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    private jwtService: JwtService,
    ){
      //this.sessions = new Map<number, string>();
    }

  

  getRedirectUrlTo42Auth(): string {
    const clientID = this.configService.get<string>('CLIENT_ID');
    const baseUrl = this.configService.get<string>('OAUTH_API42');
    const redirectUri = this.configService.get<string>('REDIRECT_URI');
    const scope = this.configService.get<string>('SCOPE');
    return `${baseUrl}?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  }

  async getAccessTokenOf42User(code: string): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(
        this.configService.get<string>('TOKEN_API42'),
        {
          grant_type: 'authorization_code',
          client_id: this.configService.get<string>('CLIENT_ID'),
          client_secret: this.configService.get<string>('CLIENT_SECRET'),
          code: code,
          redirect_uri: this.configService.get<string>('REDIRECT_URI'),
        },
      );
      return response.data.access_token;
    } catch (error) {
      console.log('[UnauthorizedException] : error in getAccessTokenOf42User\n\t[code is invalid]')
      throw new UnauthorizedException('error in getAccessTokenOf42User\n\t[code is invalid]');
    }
  }

  async getUserDataFrom42(accessToken: string): Promise<User42Dto> {
    try {
      const response: AxiosResponse = await axios.get(
        this.configService.get<string>('API42') + '/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` }});
      const { id, login, email, first_name, last_name, campus, image } = response.data;
      const userData: User42Dto = { id, login, email, first_name, last_name, campus: campus[0].name,
        image_url: image.versions.large
      };
      return userData;
    } catch (error) {
      console.log('[UnauthorizedException]: error in redirectFrom42Auth(getUserDataFrom42)\n\t[accessToken is invalid]')
      throw new UnauthorizedException('error in redirectFrom42Auth(getUserDataFrom42)\n\t[accessToken is invalid]');
    }
  }

  async jwtCreation(userId: number): Promise<{ accessToken: string }> {
    
    const payload = { userId };
    try { const accessToken = await this.jwtService.sign(payload);
    console.log('jwt creation success : [', userId, ']-', accessToken);
    return { accessToken };
    }catch (err) {
      throw new UnauthorizedException('jwt creation failed');
    }  
  }


  async downloadDefaultAvatar(url: string, id:number, accessToken: string): Promise<string> {
    try {
      const response: AxiosResponse = await axios.get(url, {
       headers: { Authorization: `Bearer ${accessToken}` }, responseType: 'stream' });
      
      const uploadDirectory = path.join(__dirname, '..', 'profile', 'images');//this.configService.get<string>("IMAGE_PATH");
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }
      const imagePath = path.join(uploadDirectory, `${id}`);
      const imageStream = fs.createWriteStream(imagePath);
      response.data.pipe(imageStream);
      return new Promise<string>((resolve, reject) => {
        imageStream.on('finish', () => resolve(imagePath));
        imageStream.on('error', reject);
      });
    }
    catch (error) {
      console.log('Error Occured in downloadDefaultProfile');
      throw new Error('Error Occured in downloadDefaultProfile');
    }
  }
}
