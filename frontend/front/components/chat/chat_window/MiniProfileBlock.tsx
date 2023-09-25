// Libaries
import { Fieldset, Button } from "@react95/core";
import { useContext } from "react";
import { useRouter } from "next/router";
// Types & Hooks & Contexts
import type { UserI, SimpUserI } from "@/types/ChatInfoType";
import { GameInvitationI } from "@/types/GameInvitationType";
import { SocketContext } from "@/context/ChatSocketContext";

interface MiniProfileBlockProps {
  friendProfile: UserI;
  userInfo: SimpUserI;
}
const MiniProfileBlock = ({
  friendProfile,
  userInfo,
}: MiniProfileBlockProps) => {
  const router = useRouter();
  const socket = useContext(SocketContext);

  const handleInviteGame = () => {
    if (!confirm(`${friendProfile.nickname}님에게 게임을 초대하시겠습니까?`))
      return;
    // 게임 초대 로직
    const gameInvitation: GameInvitationI = {
      fromUser: userInfo,
      toUser: friendProfile,
    };
    console.log("save gameInvitation in SessionStorage", gameInvitation);
    sessionStorage.setItem("gameInvitation", JSON.stringify(gameInvitation));
    alert(
      `${friendProfile.nickname}님에게 게임 초대를 보냈습니다.(초대만 보내짐.. 백엔드랑 연결x) 게임페이지로 이동합니다.`
    );
    router.push("/game/friendly");
  };
  return (
    <Fieldset
      className="flex flex-col p-2 h-min gap-2 min-w-max w-full"
      legend="Profile"
    >
      <div className=" flex flex-col items-center justify-between p-4 pb-1 w-full">
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center space-y-3 w-16">
            <span className=" text-xl">{friendProfile.nickname}</span>
          </div>
          <Button className=" text-base" onClick={handleInviteGame}>
            게임초대
          </Button>
        </div>
      </div>
      <div className="p-4 w-full">
        <Fieldset legend="Information">
          <div className="flex flex-col p-2">
            <div>Ladder: {friendProfile.ladder}</div>
            <div>Win: {friendProfile.wins}</div>
            <div>Lose: {friendProfile.loses}</div>
          </div>
        </Fieldset>
      </div>
    </Fieldset>
  );
};

export default MiniProfileBlock;
