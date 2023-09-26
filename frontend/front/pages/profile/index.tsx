import React, { useEffect, useState } from "react";
import FriendList from "@/components/profile/FriendList";
import { Button } from "@react95/core";
import MyProfile from "@/components/profile/MyProfile";
import UserProfile from "@/components/profile/UserProfile";
import { userOfList } from "@/types/UserInfo";

export default function ProfilePage() {
  const [myProfile, setMyProfile] = useState(true);
  const [friendsProfile, setFriendsProfile] = useState(true);
  const [friendList, setFriendList] = useState(true);
  const [imageURL, setImageURL] = useState("https://github.com/React95.png");

  // ??
  console.log(imageURL);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/image`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.blob();
        else throw new Error("Failed to fetch image");
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setImageURL(imageUrl);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  }, []);

  const showMyProfile = () => {
    setMyProfile((current) => !current);
  };
  const showFriendsProfile = () => {
    setFriendsProfile((current) => !current);
  };
  const showFriendList = () => {
    setFriendList((current) => !current);
  };

  const [selectedFriend, setSelectedFriend] = useState<userOfList | null>({
    id: 0,
    status: "",
    nickname: "default",
    ladder: 0,
    wins: 0,
    loses: 0,
  });
  const handleProfileClick = (friend: userOfList) => {
    setSelectedFriend(friend);
  };

  return (
    <div className=" h-screen flex flex-col items-center justify-center space-y-3">
      <div className="flex space-x-4">
        <div className="flex flex-col justify-between h-[626px]">
          {myProfile ? <MyProfile /> : null}
          {friendsProfile ? (
            <UserProfile selectedFriend={selectedFriend!} />
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
