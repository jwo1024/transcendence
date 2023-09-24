import { UserI } from "./user.interface"; 

export interface ConnectedUserI {
  id?: number;
  socketId: string;
  user: UserI;
}