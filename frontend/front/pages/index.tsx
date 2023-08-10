import Image from "next/image";
import { Inter } from "next/font/google";
import { Frame, ThemeProvider } from "@react95/core";
import LinkButton from "@/components/common/LinkButton";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const linkPageTo = () => {};
  return (
    <ThemeProvider>
      <div className="flex flex-col space-y-20 my-10 items-center">
        <LinkButton to="./game"> 레더 </LinkButton>
        <LinkButton to="/chat"> 채팅 </LinkButton>
        <LinkButton to="/profile"> 프로필 </LinkButton>
      </div>
    </ThemeProvider>
  );
}
