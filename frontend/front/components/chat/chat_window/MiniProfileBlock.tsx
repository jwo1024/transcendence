// Libaries
import { Fieldset, Button } from "@react95/core";
// Types & Hooks & Contexts
import type { UserI } from "@/types/ChatInfoType";

interface MiniProfileBlockProps {
  friendProfile: UserI;
}
const MiniProfileBlock = ({ friendProfile }: MiniProfileBlockProps) => {
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
          <Button className=" text-base">게임초대</Button>
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
