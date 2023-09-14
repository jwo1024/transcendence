import MiniProfile from "@/components/game/MiniProfile";
import React, { useEffect, useState } from "react";
import FriendList from "@/components/profile/FriendList";
import Window from "@/components/common/Window";
import { ThemeProvider, Button } from "@react95/core";
import MyProfile from "@/components/profile/MyProfile";
import FriendProfile from "@/components/profile/FriendProfile";
import { UserInfo } from "@/types/UserInfo";
// 임시 백엔드 타입용.
type user = {
  nickname: string;
  state: string;
  avatarSrc: string;
  ladder: number;
  win: number;
  lose: number;
};

export default function ProfilePage() {
  const [myProfile, setMyProfile] = useState(true);
  const [friendsProfile, setFriendsProfile] = useState(true);
  const [friendList, setFriendList] = useState(true);

  const user = localStorage.getItem("user");
  const user_obj = JSON.parse(localStorage.getItem("user") || "{}");

  const showMyProfile = () => {
    setMyProfile((current) => !current);
  };
  const showFriendsProfile = () => {
    setFriendsProfile((current) => !current);
  };
  const showFriendList = () => {
    setFriendList((current) => !current);
  };

  const [selectedFriend, setSelectedFriend] = useState<user>({
    nickname: "default",
    state: "",
    avatarSrc: "https://github.com/React95.png",
    ladder: 0,
    win: 0,
    lose: 0,
  });
  const handleProfileClick = (friend: user) => {
    setSelectedFriend(friend);
  };

  return (
    <div className=" h-screen flex flex-col items-center justify-center space-y-3">
      <div className="flex space-x-4">
        <div className="flex flex-col justify-between h-[626px]">
          {myProfile ? (
            <MyProfile
              nickname={user_obj.nickname}
              ladder={2134}
              win={23}
              lose={17}
              avatarSrc="https://github.com/React95.png"
            />
          ) : null}
          {friendsProfile ? (
            <FriendProfile selectedFriend={selectedFriend} />
          ) : null}
        </div>
        {friendList ? (
          <FriendList handleProfileClick={handleProfileClick} />
        ) : null}
      </div>
      <div className="flex space-x-3 items-center">
        <Button onClick={showMyProfile}>My Profile</Button>
        <Button onClick={showFriendsProfile}>Friend's Profile</Button>
        <Button onClick={showFriendList}>Friend List</Button>
      </div>
    </div>
  );
}
