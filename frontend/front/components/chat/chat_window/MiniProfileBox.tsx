import type { SimpUserI } from "@/types/ChatInfoType";

interface MiniProfileBoxProps {
  userInfo: SimpUserI;
}
const MiniProfileBox = ({ userInfo }: MiniProfileBoxProps) => {
  return (
    <div>
      <div>{userInfo.id}</div>
      <div>{userInfo.nickname}</div>
      <div>avatar</div>
      <div>전적</div>
    </div>
  );
};
