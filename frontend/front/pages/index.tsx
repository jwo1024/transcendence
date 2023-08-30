// import Image from "next/image";
import { Frame, ThemeProvider } from "@react95/core";
import { useState } from "react";
import LinkButton from "@/components/common/LinkButton";
import Window from "@/components/common/Window";
import Icon from "@/components/common/Icon";

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

const LoginPage = () => {
  return (
    <Window title="pong game" w="300" h="300">
      <div className="pt-16 text-center">
        <span> THIS IS PONG GAME</span>
        <br />
        <br />
        <LinkButton to="/signin"> LOG IN</LinkButton>
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
