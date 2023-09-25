import { SimpUserI } from "@/types/ChatInfoType";
// 참고형태
// interface SimpUserI {
//   id: number;
//   nickname: string;
// }

export interface GameInvitationI {
  fromUser: SimpUserI;
  toUser: SimpUserI;
}
