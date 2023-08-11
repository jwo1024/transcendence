import styled from "styled-components";

import Window from "@/components/common/Window";

const SettingWindowLayout = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  height: 100%;
  width: 20%;
`;

const ChatSettingWindow = () => {
  return (
    <SettingWindowLayout>
      <Window title="Chat Setting">chat setting box </Window>
    </SettingWindowLayout>
  );
};

export default ChatSettingWindow;
