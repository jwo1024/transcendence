import { Button } from "@react95/core";
import { useState, useContext, useEffect } from "react";
import Window from "@/components/common/Window";
import Icon from "@/components/common/Icon";
import Router from "next/router";
import { CurrentPageContext } from "@/context/PageContext";

const DesktopPage = ({ handleClick }: { handleClick: () => void }) => {
  const { setCurrentPage } = useContext(CurrentPageContext);

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    setCurrentPage("Desktop-Page");
  });

  return (
    <Icon
      src="/images/icon-image.png" // public 디렉토리 내의 경로
      alt="Icon Image" // 대체 텍스트
      text="The Pong Game"
      handleClick={handleClick}
    />
  );
};

const LoginPage = () => {
  const { setCurrentPage } = useContext(CurrentPageContext);

  useEffect(() => {
    setCurrentPage("Login-Page");
  });

  const onClick = () => {
    fetch("http://localhost:4000/auth/getUrl")
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.text();
      })
      .then((url) => {
        Router.push(url);
      })
      .catch((err) => console.log(err));
  };

  return (
    <Window title="pong game" w="300" h="300">
      <div className="pt-16 text-center">
        <span> THIS IS PONG GAME</span>
        <br />
        <br />
        <Button onClick={onClick}> LOG IN </Button>
      </div>
    </Window>
  );
};

export default function Home() {
  const [popLogin, setPopLogin] = useState(false);

  const handleClick = () => {
    setPopLogin(true);
  };

  return (
    <div className="flex flex-row  h-90vh items-center justify-center">
      {popLogin ? <LoginPage /> : <DesktopPage handleClick={handleClick} />}
    </div>
  );
}
