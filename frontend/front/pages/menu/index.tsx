import Window from "@/components/common/Window";
import LinkButton from "@/components/common/LinkButton";

const MenuPage = () => {
  return (
    <div className="flex flex-row  h-90vh items-center justify-center">
      <Window title="pong game" w="300" h="480">
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
