import { Frame } from "@react95/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import { User42Dto } from "@/types/User42Dto";

const InfoBlockLayout = ({
  menu,
  value,
}: {
  menu?: string;
  value?: string;
}) => {
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

const InfoBlock = ({
  user42Dto,
  setUser42Dto,
}: {
  user42Dto: User42Dto | null;
  setUser42Dto: React.Dispatch<React.SetStateAction<User42Dto | null>>;
}) => {
  const router = useRouter();

  useEffect(() => {
    const cookie_user = Cookies.get("user42Dto");
    if (cookie_user) {
      const data = JSON.parse(cookie_user);
      setUser42Dto({
        id: data.id,
        login: data.login,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        campus: data.campus,
      });
    } else {
      console.log("cookie_user is null");
      router.push(
        `http://localhost:3001/error/signup?error=failed_get_user42dto_cookie`
      ); // cant't find user42Dto in cookie
    }
  }, []);

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
