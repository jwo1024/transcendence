import MiniProfile from "@/components/game/MiniProfile";
import React from "react";
import DetailProfile from "@/components/profile/Detail";
import FriendList from "@/components/profile/FriendList";

export default function ProfilePage() {
  return (
    <div className="h-screen flex justify-center items-center">
      <DetailProfile
        nickname="JohnDoe"
        ladder={2134}
        win={23}
        lose={17}
        avatarSrc="https://github.com/React95.png"
      />
      <FriendList
        friends={[
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
          { nickname: "hogkim", status: "접속중" },
        ]}
      />
    </div>
  );
}
