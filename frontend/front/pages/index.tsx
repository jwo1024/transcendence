import Image from "next/image";
import { Inter } from "next/font/google";
import { Frame, ThemeProvider } from "@react95/core";
import LinkButton from "@/components/common/LinkButton";

import Window from "@/components/common/Window";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const linkPageTo = () => {};
  return (
    // <div className="m-2">
    <div className="flex flex-row  h-90vh items-center justify-center">
      <Window title="pong game" w="300" h="480">
        <ThemeProvider>
          <div className="flex flex-col space-y-20 my-20 items-center">
            <LinkButton to="./game"> 레더 </LinkButton>
            <LinkButton to="/chat"> 채팅 </LinkButton>
            <LinkButton to="/profile"> 프로필 </LinkButton>
          </div>
        </ThemeProvider>
      </Window>
    </div>
    // </div>
  );
}
