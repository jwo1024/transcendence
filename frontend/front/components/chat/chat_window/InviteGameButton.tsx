// Libraries
import { Button } from "@react95/core";
import { useRouter } from "next/router";
import { useContext } from "react";
// Types & Hooks & Contexts
import type { UserI, SimpUserI } from "@/types/ChatInfoType";
import { GameInvitationI } from "@/types/GameInvitationType";
import { SocketContext } from "@/context/ChatSocketContext";

interface InviteGameButtonProps {
  friendInfo?: SimpUserI;
  userInfo: SimpUserI;
  className?: string;
}
const InviteGameButton = ({
  friendInfo,
  userInfo,
  className,
}: InviteGameButtonProps) => {
  const router = useRouter();
  const socket = useContext(SocketContext);

  const handleInviteGame = () => {
    if (!friendInfo) return;
    if (!confirm(`${friendInfo.nickname}님에게 게임을 초대하시겠습니까?`))
      return;
    // 게임 초대 로직
    const gameInvitation: GameInvitationI = {
      fromUser: userInfo,
      toUser: friendInfo,
    };
    console.log("save gameInvitation in SessionStorage", gameInvitation);
    sessionStorage.setItem("gameInvitation", JSON.stringify(gameInvitation));
    alert(
      `${friendInfo.nickname}님에게 게임 초대를 보냈습니다.(초대만 보내짐.. 백엔드랑 연결x) 게임페이지로 이동합니다.`
    );
    router.push("/game/friendly");
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
