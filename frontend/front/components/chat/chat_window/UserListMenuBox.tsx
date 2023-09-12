import { Fieldset, Frame, Button } from "@react95/core";
import NameTag from "../common/NameTag";
import MenuBoxLayout from "../common/MenuBoxLayout";

const UserList = () => {
  const userList = [
    { name: "user1", role: "admin" },
    { name: "user2", role: "user" },
    { name: "user3", role: "user" },
    { name: "user4", role: "user" },
  ];

  return (
    <Frame
      className=" text-white p-3 overflow-y-scroll bg-zinc-800 "
      h="300"
      w="100%"
      boxShadow="in"
      bg=""
    >
      {userList.map((user, index) => {
        return (
          <div className="m-1 my-4 text-lg" key={index}>
            <input type="checkbox" />
            {/* <Checkbox className="" key={index}></Checkbox> */}
            {/* name tag 스타일 가능하도록 수정하기 */}
            <NameTag>{user.name}</NameTag>
            <NameTag>{user.role}</NameTag>
          </div>
        );
      })}
    </Frame>
  );
};

const ButtonList = () => {
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

  const handleClickInviteFriend = () => {
    console.log("invite-friend");
  };

  const handleClickLeaveChat = () => {
    console.log("leave-chat");
  };

  return (
    <>
      {/* buttons */}
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
        <div className="flex flex-col">
          <Button onClick={handleClickInviteFriend}>invite-freind</Button>
          <Button onClick={handleClickLeaveChat}>leave-chat</Button>
        </div>
      </div>
    </>
  );
};

const UserListMenuBox = () => {
  return (
    <MenuBoxLayout>
      <Fieldset className="flex flex-col p-2 w-full h-min" legend="User List">
        <UserList />
        <br />
        <ButtonList />
        <br />
        <Button className=" font-semibold">적용하기</Button>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default UserListMenuBox;
