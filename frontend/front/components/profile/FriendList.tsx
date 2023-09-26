import React, { useEffect, useState, useRef } from "react";
import { List, Input, Button, Fieldset } from "@react95/core";
import Window from "../common/Window";
import { userOfList } from "@/types/UserInfo";

interface FriendListProps {
  handleProfileClick: (friend: userOfList) => void;
}

const FriendList: React.FC<FriendListProps> = ({ handleProfileClick }) => {
  const [friendsList, setFriendsList] = useState<userOfList[]>([]);
  const [blockList, setBlockList] = useState<userOfList[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFriendList = () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/friend/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.map((friend: userOfList) => {
          if (friend.status == "0") friend.status = "오프라인";
          else if (friend.status == "1") friend.status = "온라인";
          else if (friend.status == "2") friend.status = "게임중";
          else if (friend.status == "3") friend.status = "채팅중";
        });
        setFriendsList(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchBlockList = () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/block/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setBlockList(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    // 초기 로딩
    fetchFriendList();
    fetchBlockList();
    // 5초마다 업데이트
    const intervalId1 = setInterval(fetchFriendList, 5000);
    const intervalId2 = setInterval(fetchBlockList, 5000);

    // 컴포넌트가 언마운트될 때 interval을 정리(cleanup)
    return () => {
      clearInterval(intervalId1);
      clearInterval(intervalId2);
    };
  }, []);

  // request plus friend

  const onClickAddFriend = () => {
    addFriendOrBlock("addFriendButton");
  };

  const onClickBlockUser = () => {
    addFriendOrBlock("blockButton");
  };

  const addFriendOrBlock = (clickedButton: string) => {
    // event.preventDefault();
    // 친구추가 버튼을 눌렀다면 clickedButton = "addFriendButton"
    // 차단하기 버튼을 눌렀다면 clickedButton = "blockButton"
    // submitter의 빨간줄은 무시해도됨. 브라우저에서 알아먹음

    const token = sessionStorage.getItem("accessToken");
    if (!token) return;
    // const clickedButton = event.nativeEvent.submitter.name;
    // const nicknameInput = inputRef.current?.value;
    const nickname = inputRef.current?.value;
    console.log(clickedButton);
    if (nickname == "") return alert("비었잖아..");

    let urlSuffix = "/social";
    if (clickedButton == "addFriendButton") urlSuffix += "/friend/add";
    else if (clickedButton == "blockButton") urlSuffix += "/block/add";
    else return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${urlSuffix}/${nickname}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status == 404) return alert("존재하지 않는 유저입니다.");
        else if (res.status == 409) return alert("이미 등록된 유저입니다.");
        else if (res.status == 400)
          return alert("나 자신은 영원한 인생의 친구입니다.");
        else if (res.status == 200) {
          fetchFriendList();
          fetchBlockList();
          return alert("등록되었습니다");
        } else return alert("알 수 없는 오류가 발생했습니다.");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleFriendDeleteClick = (user: userOfList) => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/social/friend/delete/${user.id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (res.ok) alert("삭제되었습니다.");
        else alert("알 수 없는 오류가 발생했습니다.");
        fetchFriendList();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleBlockDeleteClick = (user: userOfList) => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/social/block/delete/${user.id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (res.ok) alert("삭제되었습니다.");
        else alert("알 수 없는 오류가 발생했습니다.");
        fetchFriendList();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Window
      title="Friend & Block List"
      w="370"
      h="620"
      xOption={false}
      minimizeOption={false}
    >
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
                    <span>{user.status}</span>
                    <Button
                      onClick={() => handleProfileClick(user)}
                      className="w-16 h-7 flex items-center justify-center"
                    >
                      Profile
                    </Button>
                    <Button
                      onClick={() => handleFriendDeleteClick(user)}
                      className="w-16 h-7 flex items-center justify-center"
                    >
                      Delete
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
                      className="w-16 h-7 flex items-center justify-center"
                    >
                      Profile
                    </Button>
                    <Button
                      onClick={() => handleBlockDeleteClick(user)}
                      className="w-16 h-7 flex items-center justify-center"
                    >
                      Delete
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
          // onSubmit={addFriendOrBlock}
          className="flex flex-row w-full aitems-center justify-between"
        >
          <Input className=" w-64" ref={inputRef} />
          {/* <Button onClick={addFriend}>친구추가</Button> */}
          <Button className="w-20" onClick={onClickAddFriend}>
            Add
          </Button>
          <Button className="w-20" onClick={onClickBlockUser}>
            Block
          </Button>
        </form>
      </div>
    </Window>
  );
};

export default FriendList;
