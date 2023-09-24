// Libaries
import { Fieldset, Frame, Button, Input } from "@react95/core";
import { useRef, useState, useContext, useEffect } from "react";
// Components
import NameTag from "../common/NameTag";
import MenuBoxLayout from "../common/MenuBoxLayout";
// Types & Hooks & Contexts
import type {
  SimpUserI,
  RoomInviteDTO,
  RoomI,
  UserI,
  AdminRelatedDTO,
  ResponseDTO,
} from "@/types/ChatInfoType";
import { SocketContext } from "@/context/ChatSocketContext";
import {
  EMIT_ADMIN_ADD,
  EMIT_ADMIN_BAN,
  EMIT_ADMIN_KICK,
  EMIT_ADMIN_MUTE,
  EMIT_GET_USER_PROFILE,
  ON_RESPONSE_ADMIN_KICK,
  ON_RESPONSE_ADMIN_BAN,
  ON_RESPONSE_ADMIN_MUTE,
  ON_USER_PROFILE_INFO,
} from "@/types/ChatSocketEventName";

interface UserListMenuBoxProps {
  // userInfo: SimpUserI;
  roomInfo?: RoomI;
  isAdmin: boolean;
}
const UserListMenuBox = ({
  // userInfo,
  roomInfo,
  isAdmin,
}: UserListMenuBoxProps) => {
  const userList: SimpUserI[] = roomInfo?.users || [];
  const socket = useRef(useContext(SocketContext)); // TODO : check 렌더링 소켓... !
  const inviteNickRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedId(Number(e.target.value));
    console.log("e.target.value", e.target.value);
    console.log("selectedId", selectedId);
  };
  const [friendProfile, setFriendProfile] = useState<UserI | null>(null);

  useEffect(() => {
    return () => {
      socket.current?.off(ON_RESPONSE_ADMIN_KICK);
      socket.current?.off(ON_RESPONSE_ADMIN_BAN);
      socket.current?.off(ON_RESPONSE_ADMIN_MUTE);
      socket.current?.off(ON_USER_PROFILE_INFO);
    };
  }, []);

  const handleClickKick = () => {
    console.log("kick");
    emitAdminEvent(EMIT_ADMIN_KICK, ON_RESPONSE_ADMIN_KICK, "Kick");
  };
  const handleClickBan = () => {
    emitAdminEvent(EMIT_ADMIN_BAN, ON_RESPONSE_ADMIN_BAN, "Ban");
  };
  const handleClickMute = () => {
    emitAdminEvent(EMIT_ADMIN_MUTE, ON_RESPONSE_ADMIN_MUTE, "Mute");
  };

  const emitAdminEvent = (
    emitEvent: string,
    onEvent: string,
    eventName: string
  ) => {
    if (roomInfo?.roomId === undefined) return;
    if (selectedId === null) return;
    if (!confirm(`${findNickById(selectedId)}를 ${eventName} 하시겠습니까?`))
      return;
    else {
      const emitData: AdminRelatedDTO = {
        roomId: roomInfo?.roomId,
        targetUserId: selectedId,
      };
      socket.current?.emit(emitEvent, emitData);
      socket.current?.once(onEvent, (res) => {
        const resDTO: ResponseDTO = res;
        if (resDTO.success) return;
        if (resDTO.message) alert(resDTO.message);
        else alert(`${eventName}에 실패하였습니다.`);
      });
    }
  };

  const findNickById = (id: number) => {
    return userList.find((user) => user.id === id)?.nickname || "";
  };

  const handleClickViewProfile = () => {
    if (selectedId === null) return;
    console.log("targetUserId", selectedId);
    // TODO get-user-profile
    // socket.current?.emit(EMIT_GET_USER_PROFILE, selectedId);
    // socket.current?.once(ON_USER_PROFILE_INFO, (res) => {
    //   const friendProfile: UserI = res;
    //   setFriendProfile(friendProfile);
    // });
    setFriendProfile({
      nickname: findNickById(selectedId),
      state: "online",
      avatarSrc: "/images/avatars/1.png",
      ladder: 1,
      wins: 1,
      loses: 1,
    });
    console.log("view-profile");
  };

  const onSubmitInviteFriend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inviteFriendData: RoomInviteDTO = {
      targetUserNick: "jiwolee",
      roomId: 1,
    };
    console.log("invite-friend", inviteFriendData);
  };

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 h-min gap-2 min-w-max"
        legend="User List"
      >
        {/* User List */}
        <Frame
          className=" text-white p-3 overflow-y-scroll bg-zinc-800 "
          h="240"
          w="100%"
          boxShadow="in"
          bg=""
        >
          {userList?.map((user, index) => {
            return (
              <label key={index}>
                <div className="m-1 my-4 text-lg">
                  <input
                    type="radio"
                    name="useList"
                    value={user.id}
                    onChange={handleRadioChange}
                  />
                  <NameTag>{user.nickname}</NameTag>
                  <NameTag>{user.id} "role"</NameTag>
                </div>
              </label>
            );
          })}
          <span>{}</span>
        </Frame>
        {/* Buttons */}
        <div className="flex flex-col">
          <div className="flex flex-row grid-cols-5">
            <Button
              className="flex-1"
              onClick={handleClickKick}
              disabled={!isAdmin}
            >
              kick
            </Button>
            <Button
              className="flex-1"
              onClick={handleClickBan}
              disabled={!isAdmin}
            >
              ban
            </Button>
            <Button
              className="flex-1"
              onClick={handleClickMute}
              disabled={!isAdmin}
            >
              mute
            </Button>
          </div>
          <br />
          <Button onClick={handleClickViewProfile}>view-profile</Button>
          <br />
          <form onSubmit={onSubmitInviteFriend}>
            <Input ref={inviteNickRef} />
            <Button>invite-freind</Button>
          </form>
        </div>
        <br />
      </Fieldset>
      <br />

      {/* Mini Profile */}
      {friendProfile ? (
        <Fieldset
          className="flex flex-col p-2 h-min gap-2 min-w-max w-full"
          legend="Profile"
        >
          <div className=" flex flex-col items-center justify-between p-4 pb-1 w-full">
            <div className="flex items-center space-x-8">
              <img
                src={friendProfile.avatarSrc}
                alt="Avatar"
                className=" w-16 h-16"
              />
              <div className="flex flex-col items-center space-y-3 w-28">
                <span className=" text-xl">{friendProfile.nickname}</span>
                <Button className=" text-base">게임초대</Button>
              </div>
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
      ) : null}
    </MenuBoxLayout>
  );
};

export default UserListMenuBox;
