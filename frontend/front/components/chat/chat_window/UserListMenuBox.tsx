// Libaries
import { Fieldset, Frame, Button, Input } from "@react95/core";
import { useRef, useState, useContext, useEffect } from "react";
// Components
import NameTag from "@/components/chat/common/NameTag";
import MenuBoxLayout from "@/components/chat/common/MenuBoxLayout";
import MiniProfileBlock from "@/components/chat/chat_window/MiniProfileBlock";
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
  EMIT_ROOM_INVITE,
  ON_RESPONSE_ADMIN_ADD,
  ON_RESPONSE_ADMIN_BAN,
  ON_RESPONSE_ADMIN_KICK,
  ON_RESPONSE_ADMIN_MUTE,
  ON_RESPONSE_GET_USER_PROFILE,
  ON_USER_PROFILE_INFO,
  ON_RESPONSE_ROOM_INVITE,
} from "@/types/ChatSocketEventName";
import InviteGameButton from "./InviteGameButton";

interface UserListMenuBoxProps {
  userInfo: SimpUserI;
  roomInfo: RoomI;
  isAdmin: boolean;
}
const UserListMenuBox = ({
  userInfo,
  roomInfo,
  isAdmin,
}: UserListMenuBoxProps) => {
  const [userList, setUserList] = useState<SimpUserI[]>(roomInfo?.users || []);
  const socket = useRef(useContext(SocketContext)); // TODO : check 렌더링 소켓... !
  const inviteNickRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [friendProfile, setFriendProfile] = useState<UserI | null>(null);
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedId(Number(e.target.value));
    console.log("e.target.value", e.target.value);
    console.log("selectedId", selectedId);
  };

  useEffect(() => {
    return () => {
      socket.current?.off(ON_RESPONSE_ADMIN_KICK);
      socket.current?.off(ON_RESPONSE_ADMIN_BAN);
      socket.current?.off(ON_RESPONSE_ADMIN_MUTE);
      socket.current?.off(ON_RESPONSE_ADMIN_ADD);
      socket.current?.off(ON_USER_PROFILE_INFO);
    };
  }, []);

  useEffect(() => {
    if (roomInfo.users) setUserList(roomInfo?.users || []);
  }, [roomInfo]);

  const handleClickKick = () => {
    emitAdminEvent(EMIT_ADMIN_KICK, ON_RESPONSE_ADMIN_KICK, "Kick");
  };
  const handleClickBan = () => {
    emitAdminEvent(EMIT_ADMIN_BAN, ON_RESPONSE_ADMIN_BAN, "Ban");
  };
  const handleClickMute = () => {
    emitAdminEvent(EMIT_ADMIN_MUTE, ON_RESPONSE_ADMIN_MUTE, "Mute");
  };
  const handleClickMakeAdmin = () => {
    emitAdminEvent(EMIT_ADMIN_ADD, ON_RESPONSE_ADMIN_ADD, "Make-Admin");
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
      console.log("socket.emit emitEvent", emitEvent, emitData);
      socket.current?.emit(emitEvent, emitData);
      socket.current?.once(onEvent, (res) => {
        console.log("socket.on onEvent", onEvent, res);
        const resDTO: ResponseDTO = res;
        if (resDTO.success) return;
        // if (resDTO.message) alert(resDTO.message);
        else alert(`${eventName}에 실패하였습니다.`);
      });
    }
  };

  const findNickById = (id: number) => {
    return userList.find((user) => user.id === id)?.nickname || "";
  };

  const handleClickViewProfile = () => {
    if (selectedId === null) return;
    console.log("socket.emit EMIT_GET_USER_PROFILE", selectedId);
    // TODO get-user-profile
    socket.current?.emit(EMIT_GET_USER_PROFILE, selectedId);
    socket.current?.once(ON_RESPONSE_GET_USER_PROFILE, (res) => {
      console.log("Response-get-user-profile", res);
      if (res.success) return;
      setFriendProfile(null);
      alert("친구 프로필을 불러오는데 실패하였습니다.");
    });
    socket.current?.once(ON_USER_PROFILE_INFO, (res) => {
      const friendProfile: UserI = res;
      console.log("socket.on ON_USER_PROFILE_INFO", friendProfile);
      setFriendProfile(friendProfile);
    });
  };

  const onSubmitInviteFriend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inviteFriendData: RoomInviteDTO = {
      targetUserNickname: inviteNickRef.current?.value || "",
      roomId: roomInfo.roomId,
    };
    if (inviteFriendData.targetUserNickname === "")
      return alert("닉네임을 입력해주세요.");
    console.log("socket.emit EMIT_ROOM_INVITE", inviteFriendData);
    socket.current?.emit(EMIT_ROOM_INVITE, inviteFriendData);
    socket.current?.once(ON_RESPONSE_ROOM_INVITE, (res) => {
      console.log("socket.on Response-Room-invite", res);
      const resDTO: ResponseDTO = res;
      if (resDTO.success) return;
      if (resDTO.message) alert(resDTO.message);
      else alert("친구 초대에 실패하였습니다.");
    });
  };

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 h-min gap-2 min-w-max"
        legend="User List"
      >
        {/* User List */}
        <Frame
          className=" text-white p-3 overflow-auto bg-zinc-800 "
          h="240"
          w="100%"
          boxShadow="in"
          bg=""
        >
          <label>
            <UserBlock
              user={userList.find((user) => user.id === roomInfo?.roomOwner)}
              role="owner"
              handleRadioChange={handleRadioChange}
            />
          </label>
          {userList
            .filter(
              (user) =>
                user.id &&
                roomInfo?.roomAdmins.includes(user.id) &&
                user.id !== roomInfo.roomOwner
            )
            .map((user, index) => (
              <label key={index}>
                <UserBlock
                  user={user}
                  role="admin"
                  handleRadioChange={handleRadioChange}
                />
              </label>
            ))}
          {userList
            .filter(
              (user) => user.id && !roomInfo?.roomAdmins.includes(user.id)
            )
            .map((user, index) => (
              <label key={index}>
                <UserBlock
                  user={user}
                  role="user"
                  handleRadioChange={handleRadioChange}
                />
              </label>
            ))}
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
          <Button onClick={handleClickMakeAdmin} disabled={!isAdmin}>
            Make-Admin
          </Button>
          <Button onClick={handleClickViewProfile}>View-Profile</Button>
          <InviteGameButton
            friendInfo={roomInfo.users.find((user) => selectedId === user.id)}
            userInfo={userInfo}
          />
          <br />
          <form onSubmit={onSubmitInviteFriend}>
            <Input ref={inviteNickRef} placeholder="닉네임 입력" />
            <Button>invite-freind</Button>
          </form>
        </div>
        <br />
      </Fieldset>
      <br />

      {/* Mini Profile */}
      {friendProfile ? (
        <MiniProfileBlock friendProfile={friendProfile} userInfo={userInfo} />
      ) : null}
    </MenuBoxLayout>
  );
};

export default UserListMenuBox;

// Utils
// UserBlockProps
interface UserBlockProps {
  user?: SimpUserI;
  role: string;
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const UserBlock = ({ user, role, handleRadioChange }: UserBlockProps) => {
  return (
    <div className="m-1 my-4 text-lg">
      {user ? (
        <>
          <input
            type="radio"
            name="useList"
            value={user.id}
            onChange={handleRadioChange}
          />
          <NameTag>{user.nickname}</NameTag>
          <NameTag>{role}</NameTag>{" "}
        </>
      ) : null}
    </div>
  );
};
