import { SimpleUserDto } from "./simpleUser.dto";

//jchoi
export class MessageDTO {

  roomId: number; //number > 0 not null, not undefined

  userId: number;
  
  text: string; // 100자 이내 not null ,  not undefined

}

export class SimpleMessageDTO 
{
  id : number; // not null,  not undefined

  text: string; //100자 이내 not null ,  not undefined

  user: SimpleUserDto; // not null,  not undefined

  roomId: number; 

  created_at: Date;
}