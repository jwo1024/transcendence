// Libaries
import { useRef, useState, useContext, useEffect } from "react";
// Components
import MenuBoxLayout from "../common/MenuBoxLayout";
import NotifyBlock from "@/components/common/NotifyBlock";
import MiniProfileBlock from "@/components/chat/chat_window/MiniProfileBlock";
// Types & Hooks & Contexts
import type { SimpUserI, UserI } from "@/types/ChatInfoType";
import { SocketContext } from "@/context/ChatSocketContext";
import {
  EMIT_GET_USER_PROFILE,
  ON_USER_PROFILE_INFO,
  ON_RESPONSE_GET_USER_PROFILE,
} from "@/types/ChatSocketEventName";

interface MiniProfileMenuBoxProps {
  freindInfo: SimpUserI;
}
const MiniProfileMenuBox = ({ freindInfo }: MiniProfileMenuBoxProps) => {
  const socket = useRef(useContext(SocketContext)); // TODO : check 렌더링 소켓... !
  const [friendProfile, setFriendProfile] = useState<UserI | null>(null);
  const [notifyStr, setNotifyStr] = useState<string>("");

  useEffect(() => {
    handleClickViewProfile();
    return () => {
      //
    };
  }, []);

  const handleClickViewProfile = () => {
    console.log("socket.emit EMIT_GET_USER_PROFILE", freindInfo.id);
    // TODO get-user-profile
    socket.current?.emit(EMIT_GET_USER_PROFILE, freindInfo.id);
    socket.current?.once(ON_RESPONSE_GET_USER_PROFILE, (res) => {
      console.log("Response-get-user-profile", res);
      if (!res.success) setNotifyStr(res.message);
    });
    socket.current?.once(ON_USER_PROFILE_INFO, (res) => {
      const friendProfile: UserI = res;
      console.log("socket.on ON_USER_PROFILE_INFO", friendProfile);
      setFriendProfile(friendProfile);
    });
  };

  return (
    <MenuBoxLayout>
      {/* Mini Profile */}
      {friendProfile ? (
        <MiniProfileBlock friendProfile={friendProfile} />
      ) : null}
      <NotifyBlock>{notifyStr}</NotifyBlock>
    </MenuBoxLayout>
  );
};

export default MiniProfileMenuBox;
