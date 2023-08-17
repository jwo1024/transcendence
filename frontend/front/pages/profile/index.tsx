import MiniProfile from "@/components/game/MiniProfile";
import React from "react";
import DetailProfile from "@/components/profile/Detail";
import FriendList from "@/components/profile/FriendList";
import Window from "@/components/common/Window";
import { ThemeProvider } from "@react95/core";

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center h-90vh">
      <Window title="pong game" w="740" h="430">
        <ThemeProvider>
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
        </ThemeProvider>
      </Window>
    </div>
  );
}
