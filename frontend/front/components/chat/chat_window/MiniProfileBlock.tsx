// Libaries
import { Fieldset, Button } from "@react95/core";
import { useContext } from "react";
// Types & Hooks & Contexts
import type { UserI, SimpUserI } from "@/types/ChatInfoType";
import InviteGameButton from "./InviteGameButton";
import { SocketContext } from "@/context/ChatSocketContext";

interface MiniProfileBlockProps {
  friendProfile: UserI;
  userInfo: SimpUserI;
}
const MiniProfileBlock = ({
  friendProfile,
  userInfo,
}: MiniProfileBlockProps) => {
  const socket = useContext(SocketContext);

  return (
    <Fieldset
      className="flex flex-col p-2 h-min gap-2 min-w-max w-full"
      legend="Mini-Profile"
    >
      <div className=" flex flex-col items-center justify-between p-4 pb-1 w-full">
          <span className=" text-xl">{friendProfile.nickname}</span>
        {/* </div> */}
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
