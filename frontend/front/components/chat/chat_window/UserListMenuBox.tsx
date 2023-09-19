// Libaries
import { Fieldset, Frame, Button, Input } from "@react95/core";
import { useRef, useState } from "react";
// Components
import NameTag from "../common/NameTag";
import MenuBoxLayout from "../common/MenuBoxLayout";
import type { SimpUserI, RoomInviteDTO, SimpRoomI } from "@/types/ChatInfoType";
// ChatUserI 역할까지 담긴 user 정보가 필요하다

// UserListMenuBox
interface UserListMenuBoxProps {
  userInfo: SimpUserI;
  roomInfo?: SimpRoomI;
}
const UserListMenuBox = ({ userInfo, roomInfo }: UserListMenuBoxProps) => {
  const userList = [
    { nickname: "user1", id: "admin" },
    { nickname: "user2", id: "user" },
    { nickname: "user3", id: "user" },
    { nickname: "user4", id: "user" },
  ]; // tmp

  const inviteNickRef = useRef<HTMLInputElement>(null);
  const [selectedValue, setSelectedValue] = useState<string>("");
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(e.target.value);
    console.log("selectedValue", selectedValue);
  };

  const handleClickKick = () => {
    // click 된 friend 의 고유한 key 정보
    // 여러 유저들 선택이 가능하도록 할 것인지 ? 에 따라
    // 현재 user 가 admin 인지 확인
    // modal 팝업 => friend-name 을 kick 하시겠습니까?
    console.log("kick");
  };

  const handleClickBan = () => {
    console.log("ban");
  };

  const handleClickMute = () => {
    console.log("mute");
  };

  const handleClickViewProfile = () => {
    console.log("view-profile");
  };

  const onSubmitInviteFriend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const targetUserNick = inviteNickRef.current?.value;
    const inviteFriendData: RoomInviteDTO = {
      targetUserId: 1,
      roomId: 1,
      // friendId: 1,
    };
    console.log("invite-friend", inviteFriendData);
  };

  return (
    <MenuBoxLayout>
      <Fieldset
        className="flex flex-col p-2 h-min gap-2 min-w-max"
        legend="User List"
      >
        <Frame
          className=" text-white p-3 overflow-y-scroll bg-zinc-800 "
          h="240"
          w="100%"
          boxShadow="in"
          bg=""
        >
          {userList?.map((user, index) => {
            return (
              <label>
                <div className="m-1 my-4 text-lg" key={index}>
                  <input
                    type="radio"
                    name="useListr"
                    value={user.id}
                    onChange={handleRadioChange}
                  />
                  {/* name tag 스타일 가능하도록 수정하기 */}
                  <NameTag>{user.nickname}</NameTag>
                  <NameTag>{user.id} "role"</NameTag>
                </div>
              </label>
            );
          })}
          {/*  get radio button's selected value */}
          <span>{}</span>
        </Frame>
        {/* <br /> */}
        <div className="flex flex-col">
          {/* Button onClick => Modal 팝업 되도록 */}
          <div className="flex flex-row grid-cols-5">
            <Button className="flex-1" onClick={handleClickKick}>
              kick
            </Button>
            <Button className="flex-1" onClick={handleClickBan}>
              ban
            </Button>
            <Button className="flex-1" onClick={handleClickMute}>
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
    </MenuBoxLayout>
  );
};

export default UserListMenuBox;
