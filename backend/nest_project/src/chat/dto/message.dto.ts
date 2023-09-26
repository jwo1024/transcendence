import { SimpleUserDto } from "./simpleUser.dto";
import { IsString } from "class-validator";

export class MessageDTO {

  roomId: number; 
  userId: number;
  
  @IsString()
  text: string;
}

export class SimpleMessageDTO 
{
  id : number; 

  text: string; 

  user: SimpleUserDto; 

  roomId: number; 

  created_at: Date;
}