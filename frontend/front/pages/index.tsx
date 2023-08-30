// import Image from "next/image";
import { Button, Frame, ThemeProvider } from "@react95/core";
import { Frame, ThemeProvider, Button } from "@react95/core";
import { useState } from "react";
// import LinkButton from "@/components/common/LinkButton";
import Window from "@/components/common/Window";
import Icon from "@/components/common/Icon";
import Router from "next/router";

const DesktopPage = ({ handleClick }: { handleClick: () => void }) => {
  return (
    <Icon
      src="/images/icon-image.png" // public 디렉토리 내의 경로
      alt="Icon Image" // 대체 텍스트
      text="The Pong Game"
      handleClick={handleClick}
    />
  );
};
// Router에 왜 .push가 없나요?

// 저거 없어도 돼요 next 로 이미 하고 있어서 ㅎㅎ

/*
        긴급 미션
        LinkButton to 요소에 들어갈 것?
        그럼 지금 요청을 받아와야하는거죠? 오키
        'localhost:4000/login/getUrl' 에 get요청을 보내서 받아온 response.data가 to에 들어가야 함
        그런 코드를 작성 부탁드립니다.

        1분 주갓습니다.
        여기서 해주세요 

        테스트용이니까 아무거나 해도 됩니다.
*/
// useRouter 는 처음 써봐서 되는지 모르겟어요

const LoginPage = () => {
  const onClick = () => {
    // fetch("http://localhost:4000/login/first")
    fetch("http://localhost:3001/api/login")
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        console.log("res", "RES : " + res);
        return res.text();
      })
      .then((url) => {
        console.log("url", "URL : " + url);
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
