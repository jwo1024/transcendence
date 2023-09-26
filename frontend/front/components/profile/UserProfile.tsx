import { FC, useState, useEffect } from "react";
import { Fieldset } from "@react95/core";
import Window from "../common/Window";
import { userOfList } from "@/types/UserInfo";

interface ProfileProps {
  selectedFriend: userOfList;
}

const UserProfile: FC<ProfileProps> = ({ selectedFriend }) => {
  const [profileAvatarSrc, setProfileAvatarSrc] = useState<string | undefined>(
    "https://github.com/React95.png"
  );

  useEffect(() => {
    if (selectedFriend.id === undefined || selectedFriend.id == 0) return;
    const token = sessionStorage.getItem("accessToken");
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/image/${selectedFriend.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (res.ok) return res.blob();
        else throw new Error("Failed to fetch image");
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setProfileAvatarSrc(imageUrl);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  }, [selectedFriend]);

  return (
    <Window
      title="User Profile"
      w="320"
      h="260"
      xOption={false}
      minimizeOption={false}
    >
      <div className=" flex flex-col items-center justify-between p-4 pb-1">
        <div className="flex items-center space-x-8">
          <img src={profileAvatarSrc} alt="Avatar" className=" w-32 h-32" />
          <div className="flex flex-col items-center space-y-3 w-28">
            <span className=" text-3xl">{selectedFriend.nickname}</span>
          </div>
        </div>
      </div>
      <div className="p-4 w-full">
        <Fieldset legend="Information">
          <div className="flex flex-col p-2">
            <div>Ladder: {selectedFriend.ladder}</div>
            <div>Win: {selectedFriend.wins}</div>
            <div>Lose: {selectedFriend.loses}</div>
          </div>
        </Fieldset>
      </div>
    </Window>
  );
};

export default UserProfile;
