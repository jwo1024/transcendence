import { SimpleUserDto } from "./simpleUser.dto";

export class MessageDTO {

  roomId: number;

  userId: number;
  
  text: string;

}

export class SimpleMessageDTO 
{

  text: string;

  user: SimpleUserDto;

  created_at: Date;
}