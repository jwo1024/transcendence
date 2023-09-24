import { SimpleUserDto } from "./simpleUser.dto";

export class MessageDTO {

  roomId: number;

  userId: number;
  
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