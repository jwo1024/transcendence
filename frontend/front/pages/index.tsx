// import Image from "next/image";
import { Button, Frame, ThemeProvider } from "@react95/core";
import { useState } from "react";
// import LinkButton from "@/components/common/LinkButton";
import Window from "@/components/common/Window";
import Icon from "@/components/common/Icon";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const handleClick = () => {
    fetch("http://localhost:4000/login/getUrl")
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        console.log(data);
        router.push(data.toString());
      });
  };

  return (
    <Window title="pong game" w="300" h="300">
      <div className="pt-16 text-center">
        <span> THIS IS PONG GAME</span>
        <br />
        <br />
        <Button onClick={handleClick}> LOG IN </Button>
        {/* <LinkButton to="/signin"> LOG IN</LinkButton> */}
      </div>
    </Window>
  );
};

// const IndexPage = () => {
//   return (
//     <Window title="pong game" w="300" h="480">
//       <ThemeProvider>
//         <div className="flex flex-col space-y-20 my-20 items-center">
//           <LinkButton to="./game"> 레더 </LinkButton>
//           <LinkButton to="/chat"> 채팅 </LinkButton>
//           <LinkButton to="/profile"> 프로필 </LinkButton>
//         </div>
//       </ThemeProvider>
//     </Window>
//   );
// };

export default function Home() {
  const linkPageTo = () => {};

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
