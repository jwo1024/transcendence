import Link from "next/link";
import Window from "@/components/common/Window";
import LinkButton from "@/components/common/LinkButton";
import { Button, Input } from "@react95/core";
import { useEffect, useState } from "react";

interface User42Dto {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  campus: string;
} // from backend

const SignUpPage = () => {
  const [user42Dto, setUser42Dto] = useState<User42Dto | null>(null);

  useEffect(() => {
    console.log("mount SignUpPage");
    const fetchUser42Data = async () => {
      const res = await fetch("http://localhost:4000/auth")
        .then((res) => {
          console.log(res.json);
          // const obj;
          // const data : User42Dto = res.json.toString;
          // return;

        })
        // .then ((obj) => {
        //   const data : User42Dto = obj;
        //   setUser42Dto(data);
        // })
        .catch((err) => console.log(err));
        fetchUser42Data();
    };
  }, []);



  return (
    <div className="flex flex-col  h-90vh items-center justify-center">
      <Link href="/" className=" text-lg">
        TMP HOME LINK
      </Link>
      <Window title="Sign in Page" w="300" h="480">
        <div className="flex flex-col space-y-3 m-3 items-right">
          <div>
            고정되는 유저 정보
            <div className="px-5">itra id</div>
            <div className="px-5">mail</div>
            <div className="px-5">first name</div>
            <div className="px-5">last name</div>
          </div>
          <div>
            nick name 설정 & 조건 (input box)
            <Input placeholder="Nick Name" />
            <div className="px-5">
              유니크한 닉네임인지, 닉네임글자수 제한 등 확인해야한다.
            </div>
          </div>
          <div>
            avatar 이미지 업로드
            <div className="px-5">
              <Button>Upload</Button>
            </div>
          </div>
        </div>
        <LinkButton to="/menu"> Sign - up </LinkButton>
      </Window>
    </div>
  );
};

export default SignUpPage;
