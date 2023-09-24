export interface SignupDto {
  id: number;
  nickname: string;
  enable2FA: boolean;
  data2FA?: string;
}

export interface User42Dto {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  campus: string;
  //   image_url: string;
}

export interface UserSessionStorage {
  id: number;
  nickname: string;
  status: number;
  ladder: number;
  wins: number;
  loses: number;
}
