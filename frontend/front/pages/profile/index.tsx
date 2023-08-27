import MiniProfile from "@/components/game/MiniProfile";
import React from "react";
import FriendList from "@/components/profile/FriendList";
import Window from "@/components/common/Window";
import { ThemeProvider } from "@react95/core";
import MyProfile from "@/components/profile/MyProfile";
import FriendProfile from "@/components/profile/FriendProfile";

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-screen flex justify-center items-center space-x-4">
        <div className="flex flex-col justify-between h-[626px]">
          <MyProfile
            nickname="hogkim"
            ladder={2134}
            win={23}
            lose={17}
            avatarSrc="https://github.com/React95.png"
          />
          <FriendProfile
            nickname="JohnDoe"
            ladder={2134}
            win={23}
            lose={17}
            avatarSrc="https://github.com/React95.png"
          />
        </div>
        <FriendList
          friends={[
            { nickname: "hogkim", status: "접속중" },
            { nickname: "hogkim", status: "접속중" },
            { nickname: "hogkim", status: "접속중" },
            { nickname: "hogkim", status: "접속중" },
          ]}
        />
      </div>
    </div>
  );
}
