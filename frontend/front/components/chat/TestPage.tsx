// Libraies
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@react95/core";
// Components
import Window from "../common/Window";
// Types & Hooks & Contexts
import { SocketContext } from "@/context/ChatSocketContext";

type roomType = "open" | "private" | "dm";
interface RoomCreateDTO {
  roomName: string;
  roomType: roomType;
  roomPass?: string;
}
interface RoomJoinDTO {
  roomId: number;
  roomPass?: string;
}
interface MessageDTO {
  roomId: number;
  userId: number;
  text: string;
}
interface RoomCreateDTO {
  roomName: string;
  roomType: roomType;
  roomPass?: string;
}
interface AdminRelatedDTO {
  targetUserId: number;
  roomId: number;
}
interface RoomInviteDTO {
  targetUserId: number;
  roomId: number;
}

const TestPage = () => {
  const socket = useContext(SocketContext);
  const [roomId, setRoomId] = useState<number>(0);
  const [userId, setUserId] = useState<number>(0);
  const [roomPass, setRoomPass] = useState<string>("1234");
  const [roomType, setRoomType] = useState<roomType>("open");
  const [roomName, setRoomName] = useState<string>("test room");
  const [targetUserId, setTargetUserId] = useState<number>(0);
  const [text, setText] = useState<string>("test message");
  const [userNickName, setUserNickName] = useState<string>("test-user");

  const onClickRoomCreate = () => {
    const createRoom: RoomCreateDTO = {
      roomName: roomName,
      roomType: roomType,
      roomPass: roomPass === "" ? undefined : roomPass,
    };
    console.log("socket.emit Room-create", createRoom);
    console.log("socket", socket);
    socket?.emit("Room-create", createRoom);
  };

  const onClickRoomJoin = () => {
    const joinRoom: RoomJoinDTO = {
      roomId: roomId,
      roomPass: roomPass === "" ? undefined : roomPass,
    };
    console.log("socket.emit Room-join", joinRoom);
    socket?.emit("Room-join", joinRoom);
  };

  const onClickRoomLeave = () => {
    const leaveRoom: RoomJoinDTO = {
      roomId: roomId,
    };
    console.log("socket.emit Room-leave", leaveRoom);
    socket?.emit("Room-leave", leaveRoom);
  }; // API 문서에 어떤 형태로 보내야 하는지 정보가 없음

  const onClickMessageAdd = () => {
    const messageAdd: MessageDTO = {
      roomId: roomId,
      userId: userId,
      text: text,
    };
    console.log("socket.emit Message-add", messageAdd);
    socket?.emit("Message-add", messageAdd);
  };

  const onClickOwnerRoomEdit = () => {
    const editRoom: RoomCreateDTO = {
      roomName: roomName,
      roomType: roomType,
      roomPass: roomPass === "" ? undefined : roomPass,
    };
    const sendRoomId = roomId;
    console.log("socket.emit Owner-Room-edit", editRoom, sendRoomId);
    socket?.emit("Owner-Room-edit", editRoom, sendRoomId);
  };

  const onClickAdminAdd = () => {
    const adminAdd: AdminRelatedDTO = {
      targetUserId: targetUserId,
      roomId: roomId,
    };
    console.log("socket.emit Admin-add", adminAdd);
    socket?.emit("Admin-add", adminAdd);
  };

  const onClickDmCreate = () => {
    const dmCreate: AdminRelatedDTO = {
      targetUserId: targetUserId,
      roomId: roomId,
    };
    const sendUserNickName = userNickName;
    console.log("socket.emit DM-create", dmCreate);
    socket?.emit("DM-create", dmCreate, sendUserNickName);
  };

  const onClickAdminKick = () => {
    const adminKick: AdminRelatedDTO = {
      targetUserId: targetUserId,
      roomId: roomId,
    };
    console.log("socket.emit Admin-kick", adminKick);
    socket?.emit("Admin-kick", adminKick);
  };

  const onClickAdminBan = () => {
    const adminBan: AdminRelatedDTO = {
      targetUserId: targetUserId,
      roomId: roomId,
    };
    console.log("socket.emit Admin-ban", adminBan);
    socket?.emit("Admin-ban", adminBan);
  };

  const onClickAdminMute = () => {
    const adminMute: AdminRelatedDTO = {
      targetUserId: targetUserId,
      roomId: roomId,
    };
    console.log("socket.emit Admin-mute", adminMute);
    socket?.emit("Admin-mute", adminMute);
  };

  const onClickAddUserBlock = () => {
    const sendUserId = userId;
    console.log("socket.emit add-user-block", sendUserId);
    socket?.emit("add-user-block", sendUserId);
  };

  const onClickRoomInvite = () => {
    const roomInvite: RoomInviteDTO = {
      targetUserId: targetUserId,
      roomId: roomId,
    };
    console.log("socket.emit Room-invite", roomInvite);
    socket?.emit("Room-invite", roomInvite);
  };

  const onClickRoomEnter = () => {
    const sendRoomId = roomId;
    console.log("socket.emit Room-enter", sendRoomId);
    socket?.emit("Room-enter", sendRoomId);
  };

  const onClickGetUserProfile = () => {
    const userId = 1;
    console.log("socket.emit get-user-profile", userId);
    socket?.emit("get-user-profile", userId);
  };

  const onChangeRoomId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(Number(event.target.value));
  };
  const onChangeUserId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(Number(event.target.value));
  };
  const onChangeRoomPass = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomPass(event.target.value);
  };
  const onChangeRoomType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomType(event.target.value as roomType);
  };
  const onChangeRoomName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };
  const onChangeTargetUserId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTargetUserId(Number(event.target.value));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };
  const onChangeUserNickName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserNickName(event.target.value);
  };

  return (
    <Window
      title="Waiting Room"
      xOption={false}
      className="flex flex-row text-center"
    >
      <div className="flex flex-row text-center  space-y-4 space-x-4 m-10">
        <input
          type="number"
          value={roomId.toString()}
          onChange={onChangeRoomId}
        />
        <div>roomId : {roomId}</div>
        <input
          type="number"
          value={userId.toString()}
          onChange={onChangeUserId}
        />
        <div>userId : {userId}</div>
        <input value={roomPass} onChange={onChangeRoomPass} />
        <div>roomPass : {roomPass}</div>
        {/* onchageRoomtype 수정 */}
        <input value={roomType} onChange={onChangeRoomType} />
        <div>roomType : {roomType}</div>
      </div>
      <div className="flex flex-row text-center  space-y-4 space-x-4 m-10">
        <input value={roomName} onChange={onChangeRoomName} />
        <div>roomName : {roomName}</div>
        <input
          type="number"
          value={targetUserId.toString()}
          onChange={onChangeTargetUserId}
        />
        <div>targetUserId : {targetUserId}</div>
        <input value={text} onChange={onChangeText} />
        <div>text : {text}</div>
        <input value={userNickName} onChange={onChangeUserNickName} />
        <div>userNickName : {userNickName}</div>
      </div>
      <div className="flex flex-row text-center  space-y-4 space-x-4 m-10">
        <div className=" flex flex-col w-auto space-y-4 space-x-4">
          <Button onClick={onClickRoomCreate}>"Room-create"</Button>
          <Button onClick={onClickRoomJoin}>"Room-join"</Button>
          <Button onClick={onClickRoomLeave}>"Room-leave"</Button>
          <Button onClick={onClickMessageAdd}>"Message-add"</Button>
          <Button onClick={onClickOwnerRoomEdit}>"Owner-Room-edit"</Button>
        </div>
        <div className=" flex flex-col w-auto space-y-4 space-x-4">
          <Button onClick={onClickAdminAdd}>"Admin-add"</Button>
          <Button onClick={onClickDmCreate}>"DM-create"</Button>
          <Button onClick={onClickAdminKick}>"Admin-kick"</Button>
          <Button onClick={onClickAdminBan}>"Admin-Ban"</Button>
          <Button onClick={onClickAdminMute}>"Admin-mute"</Button>
        </div>
        <div className="  flex flex-col w-auto space-y-4 space-x-4">
          <Button onClick={onClickAddUserBlock}>"add-user-block"</Button>
          <Button onClick={onClickRoomInvite}>"Room-invite"</Button>
          <Button onClick={onClickRoomEnter}>"Room-enter"</Button>
          <Button onClick={onClickGetUserProfile}>"get-user-profile"</Button>
        </div>
      </div>
    </Window>
  );
};

export default TestPage;
