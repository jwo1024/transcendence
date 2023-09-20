import React, { useEffect, useState } from "react";
import {
  Frame,
  ThemeProvider,
  List,
  Input,
  Button,
  Fieldset,
} from "@react95/core";
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
  const [blockList, setBlockList] = useState<users>([]);

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
  const fetchBlockList = () => {
    fetch("http://localhost:3001/api/friendList")
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((res) => {
        setBlockList(res);
      })
      .catch(() => console.log("bad response"));
  };

  useEffect(() => {
    // 초기 로딩
    fetchFriendList();
    fetchBlockList();
    // 5초마다 업데이트
    const intervalId1 = setInterval(fetchFriendList, 3000);
    const intervalId2 = setInterval(fetchBlockList, 3000);

    // 컴포넌트가 언마운트될 때 interval을 정리(cleanup)
    return () => {
      clearInterval(intervalId1);
      clearInterval(intervalId2);
    };
  }, []);

  // request plus friend

  const addFriendOrBlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 친구추가 버튼을 눌렀다면 clickedButton = "addFriendButton"
    // 차단하기 버튼을 눌렀다면 clickedButton = "blockButton"
    // submitter의 빨간줄은 무시해도됨. 브라우저에서 알아먹음
    const clickedButton = event.nativeEvent.submitter.name;

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
    <Window title="Friend & Block List" w="370" h="620">
      <div className="overflow-auto flex-grow p-2">
        <div className="flex flex-col p-1 w-full space-y-3">
          <Fieldset legend="Friend List" className="pb-2 pr-2">
            <ul className="space-y-1 w-full">
              {friendsList.map((user, index) => (
                <List.Item
                  key={index}
                  className="flex w-full items-center justify-between text-lg"
                >
                  <strong>{user.nickname}</strong>
                  <div className="flex items-center space-x-2">
                    <span>{user.state}</span>
                    <Button
                      onClick={() => handleProfileClick(user)}
                      className=" h-7 flex items-center justify-center"
                    >
                      프로필 보기
                    </Button>
                  </div>
                </List.Item>
              ))}
            </ul>
          </Fieldset>
          <Fieldset legend="Block List" className="pb-2 pr-2">
            <ul className="space-y-1 w-full">
              {blockList.map((user, index) => (
                <List.Item
                  key={index}
                  className="flex w-full items-center justify-between text-lg"
                >
                  <strong>{user.nickname}</strong>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleProfileClick(user)}
                      className=" h-7 flex items-center justify-center"
                    >
                      프로필 보기
                    </Button>
                  </div>
                </List.Item>
              ))}
            </ul>
          </Fieldset>
        </div>
      </div>
      <div className="flex items-center justify-between py-3 px-2 border-2 border-white">
        <form
          onSubmit={addFriendOrBlock}
          className="flex flex-row w-full items-center justify-between"
        >
          <Input className=" w-52" />
          {/* <Button onClick={addFriend}>친구추가</Button> */}
          <Button name="addFriendButton">친구추가</Button>
          <Button name="blockButton">차단하기</Button>
        </form>
      </div>
    </Window>
  );
};

export default FriendList;
