import { List } from "@react95/core";
import Router from "next/router";

const MenuList = () => {
  const router = Router;
  const onClickLogout = () => {
    // home -> home 무시
    if (router.pathname === "/") return;
    if (confirm("로그아웃 하시겠습니까?")) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logoff`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      })
        .then((res) => {
          res.ok && router.push("/");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const onClickMenu = () => {
    if (router.pathname === "/menu") return;
    router.push("/menu");
  };

  const onClickGame = () => {
    if (router.pathname === "/game") return;
    router.push("/game");
  };

  const onClickChat = () => {
    if (router.pathname === "/chat") return;
    router.push("/chat");
  };

  const onClickProfile = () => {
    if (router.pathname === "/profile") return;
    router.push("/profile");
  };

  return (
    <List className="fixed bottom-9">
      <List.Item onClick={onClickMenu}>Menu</List.Item>
      <List.Item onClick={onClickGame}>Game</List.Item>
      <List.Item onClick={onClickChat}>Chat</List.Item>
      <List.Item onClick={onClickProfile}>Profile</List.Item>
      <List.Item onClick={onClickLogout}>Logout</List.Item>
    </List>
  );
};

export default MenuList;
