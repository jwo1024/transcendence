// Libraries
import { Button } from "@react95/core";
import { useRouter } from "next/router";
import { useContext } from "react";
// Types & Hooks & Contexts
import type { SimpUserI, ResponseDTO } from "@/types/ChatInfoType";
import { SocketContext } from "@/context/ChatSocketContext";
import {
  EMIT_GAME_INVITE,
  ON_RESPONSE_GAME_INVITE,
} from "@/types/ChatSocketEventName";

interface InviteGameButtonProps {
  friendInfo?: SimpUserI;
  userInfo: SimpUserI;
  className?: string;
}
const InviteGameButton = ({ friendInfo, className }: InviteGameButtonProps) => {
  const router = useRouter();
  const socket = useContext(SocketContext);

  const handleInviteGame = () => {
    if (!friendInfo) return;
    if (!confirm(`${friendInfo.nickname}님에게 게임을 초대하시겠습니까?`))
      return;
    socket?.emit(EMIT_GAME_INVITE, { targetId: friendInfo.id });
    console.log("게임 초대 보냄", friendInfo.id);
    socket?.on(ON_RESPONSE_GAME_INVITE, (data) => {
      console.log("socket?.on ON_RESPONSE_GAME_INVITE", data);
      const res: ResponseDTO = data;
      if (res.success) {
        router.push("/game/friendly");
      } else {
        alert(
          `[${friendInfo.nickname}]님 게임 초대에 실패했습니다. : ${res?.message}`
        );
      }
    });
  };

  return (
    <Button
      className={className ? className : "text-base"}
      onClick={handleInviteGame}
    >
      게임초대
    </Button>
  );
};

export default InviteGameButton;
