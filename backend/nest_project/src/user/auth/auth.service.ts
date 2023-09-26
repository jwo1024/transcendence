import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { User42Dto } from './dto/user42.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from '../profile/user-profile.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private static readonly sessions: Map<number, string> = new Map<number, string>();

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    private jwtService: JwtService,
    ){}

  public static setSession(userId: number, token: string) {
    AuthService.sessions.set(userId, token);
    console.log('session set success : [', userId, ']-', token);
  }

  public static endSession(userId: number) {
    AuthService.sessions.delete(userId);
    console.log('session end success : [', userId, ']-', AuthService.sessions.get(userId));
  }
  
  public static getSession(userId: number): string {
    return AuthService.sessions.get(userId);
  }
  
  public static isSessionExist(userId: number): boolean {
    return AuthService.sessions.has(userId);
  }

  public static isTokenValid(userId: number, token: string): boolean {
    return (token && this.isSessionExist(userId) &&  token === AuthService.sessions.get(userId));
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
  
  async downloadDefaultAvatar(url: string, id:number, accessToken: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }, responseType: 'stream' });
        return response.data;
    }
    catch (error) {
      console.log('Error Occured in downloadDefaultProfile');
      throw new Error('Error Occured in downloadDefaultProfile');
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
  
}