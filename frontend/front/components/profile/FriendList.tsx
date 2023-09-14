import React, { useEffect, useState } from "react";
import { Frame, ThemeProvider, List, Input, Button } from "@react95/core";
import { Fax } from "@react95/icons";
import Window from "../common/Window";
import Cookies from "js-cookie";

// 임시 백엔드 타입용.
type user = {
  nickname: string;
  state: string;
  avatarSrc: string;
  ladder: number;
  win: number;
  lose: number;
};
type users = user[];

interface FriendListProps {
  handleProfileClick: (friend: user) => void;
}

// const FriendList: React.FC<FriendListProps> = ({ handleProfileClick }) => {
//   // load friend list....
//   const [friendsList, setFriendsList] = useState<users>([]);
//   useEffect(() => {
//     fetch("http://localhost:3001/api/friendList")
//       .then((res) => res.json())
//       .then((res) => {
//         setFriendsList(res);
//       });
//   }, []);
const FriendList: React.FC<FriendListProps> = ({ handleProfileClick }) => {
  const [friendsList, setFriendsList] = useState<users>([]);

  const fetchFriendList = () => {
    fetch("http://localhost:3001/api/friendList")
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((res) => {
        setFriendsList(res);
      })
      .catch(() => console.log("bad response"));
  };

  useEffect(() => {
    // 초기 로딩
    fetchFriendList();

    // 5초마다 업데이트
    const intervalId = setInterval(fetchFriendList, 3000);

    // 컴포넌트가 언마운트될 때 interval을 정리(cleanup)
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // request plus friend

  const addFriend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // const data = Cookies.get("accessToken");
    // console.log(data);
    // if (data) {
    // const token = JSON.parse(data);
    // fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/addFriend`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `bearer ${token}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     // id: user42Dto?.id,
    //     // nickname: nickName,
    //   }),
    // });
    // }
  };

  return (
    <Window title="Friend List" w="370" h="620">
      <div className="overflow-auto flex-grow p-1">
        <ul className="space-y-2 w-full">
          {friendsList.map((friend, index) => (
            <List.Item
              key={index}
              className="flex w-full items-center justify-between"
            >
              <strong>{friend.nickname}</strong>
              <div className="flex items-center space-x-2">
                <span>{friend.state}</span>
                <Button
                  onClick={() => handleProfileClick(friend)}
                  className=" h-7 flex items-center justify-center"
                >
                  프로필 보기
                </Button>
              </div>
            </List.Item>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between p-4 pt-4 border-2 border-white">
        <form onSubmit={addFriend}>
          <Input className=" w-60" />
          {/* <Button onClick={addFriend}>친구추가</Button> */}
          <Button>친구추가</Button>
        </form>
      </div>
    </Window>
  );
};

export default FriendList;
