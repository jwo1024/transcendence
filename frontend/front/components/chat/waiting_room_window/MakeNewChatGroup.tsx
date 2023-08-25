import { Fieldset, Input, Button } from "@react95/core";
import SelectButton from "@/components/common/SelectButton";
import type { FrameButtonProps } from "@/components/common/SelectButton";
import MenuBoxLayout from "../common/MenuBoxLayout";

const MakeNewChatGroup = () => {
  const frameElement: FrameButtonProps[] = [
    { children: "공개방", handleClickCustom: () => console.log("공개방 클릭") },
    { children: "비공개방" },
  ];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // reload 방지
    console.log("submit");
    // backend 로 방만들기 제출
  };

  return (
    <MenuBoxLayout>
      <Fieldset className="flex flex-col p-2 w-full h-min" legend="User List">
        {/*  방제목 입력 */}
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <Input placeholder="방제 입력" />
          <Input placeholder="비밀번호 입력" />
          <SelectButton frameButton={frameElement} />
          <br />
          <Button className=" font-semibold">방 만들기</Button>
        </form>
      </Fieldset>
    </MenuBoxLayout>
  );
};

export default MakeNewChatGroup;
