import Window from "@/components/common/Window";
import LinkButton from "@/components/common/LinkButton";
import { useContext } from "react";
import { CurrentPageContext } from "@/context/PageContext";

const MenuPage = () => {
  const { setCurrentPage } = useContext(CurrentPageContext);
  
  setCurrentPage("Menu-Page");
  return (
    <div className="flex flex-row  h-90vh items-center justify-center">
      <Window title="pong game" w="300" h="480" xOption={false}>
        <div className="flex flex-col space-y-20 my-20 items-center">
          <LinkButton to="./game"> 레더 </LinkButton>
          <LinkButton to="/chat"> 채팅 </LinkButton>
          <LinkButton to="/profile"> 프로필 </LinkButton>
        </div>
      </Window>
    </div>
  );
};

export default MenuPage;
