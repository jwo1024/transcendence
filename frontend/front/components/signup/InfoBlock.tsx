import { Frame } from "@react95/core";
import { User42Dto } from "@/types/User42Dto";

interface InfoBlockLayoutProps {
  menu?: string;
  value?: string;
}
const InfoBlockLayout = ({ menu, value }: InfoBlockLayoutProps) => {
  return (
    <div className="flex flex-row ">
      <Frame
        className=" w-20 text-center border border-black px-p-2px mr-1	font-extrabold"
        w=""
      >
        {menu}
      </Frame>
      <Frame
        className="flex-1 pl-3 border border-black bg-zinc-400"
        boxShadow="in"
        bg=""
      >
        {value}
      </Frame>
    </div>
  );
};

interface InfoBlockProps {
  user42Dto: User42Dto | null;
}
const InfoBlock = ({ user42Dto }: InfoBlockProps) => {
  return (
    <div>
      안녕하세요 ! {user42Dto?.login} 님
      <div className="flex flex-col border border-black mx-5 p-0.5 p-x-1 space-y-1">
        <InfoBlockLayout menu="id" value={user42Dto?.id.toString()} />
        <InfoBlockLayout menu="login" value={user42Dto?.login} />
        <InfoBlockLayout menu="email" value={user42Dto?.email} />
        <InfoBlockLayout menu="first name" value={user42Dto?.first_name} />
        <InfoBlockLayout menu="last name" value={user42Dto?.last_name} />
        <InfoBlockLayout menu="campus" value={user42Dto?.campus} />
      </div>
    </div>
  );
};

export default InfoBlock;
