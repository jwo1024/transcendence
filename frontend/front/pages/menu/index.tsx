import Window from "@/components/common/Window";
import LinkButton from "@/components/common/LinkButton";

const MenuPage = () => {
  return (
    <div className="flex flex-row  h-90vh items-center justify-center">
      <Window title="pong game" w="300" h="480" xOption={false}>
        <div className="flex flex-col space-y-20 my-20 items-center">
          <LinkButton to="./game">
            <span className="text-3xl">Ladder</span>
          </LinkButton>
          <LinkButton to="/chat">
            <span className="text-3xl">Chatting</span>
          </LinkButton>
          <LinkButton to="/profile">
            <span className="text-3xl">Profile</span>
          </LinkButton>
        </div>
      </Window>
    </div>
  );
};

export default MenuPage;
