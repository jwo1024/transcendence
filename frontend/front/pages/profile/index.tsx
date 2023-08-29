import MiniProfile from "@/components/game/MiniProfile";
import React, { useState } from "react";
import FriendList from "@/components/profile/FriendList";
import Window from "@/components/common/Window";
import { ThemeProvider, Button } from "@react95/core";
import MyProfile from "@/components/profile/MyProfile";
import FriendProfile from "@/components/profile/FriendProfile";

export default function ProfilePage() {
  const [myProfile, setMyProfile] = useState(true);
  const [friendsProfile, setFriendsProfile] = useState(true);
  const [friendList, setFriendList] = useState(true);
  const showMyProfile = () => {
    setMyProfile((current) => !current);
  };
  const showFriendsProfile = () => {
    setFriendsProfile((current) => !current);
  };
  const showFriendList = () => {
    setFriendList((current) => !current);
  };
  return (
    <div className=" h-screen flex flex-col items-center justify-center space-y-3">
      <div className="flex space-x-4">
        <div className="flex flex-col justify-between h-[626px]">
          {myProfile ? (
            <MyProfile
              nickname="hogkim"
              ladder={2134}
              win={23}
              lose={17}
              avatarSrc="https://github.com/React95.png"
            />
          ) : null}
          {friendsProfile ? (
            <FriendProfile
              nickname="JohnDoe"
              ladder={2134}
              win={23}
              lose={17}
              avatarSrc="https://github.com/React95.png"
            />
          ) : null}
        </div>
        {friendList ? <FriendList /> : null}
      </div>
      <div className="flex space-x-3 items-center">
        <Button onClick={showMyProfile}>My Profile</Button>
        <Button onClick={showFriendsProfile}>Friend's Profile</Button>
        <Button onClick={showFriendList}>Friend List</Button>
      </div>
    </div>
  );
}
