import Link from "next/link";
import Window from "@/components/common/Window";
import LinkButton from "@/components/common/LinkButton";
import { Button, Input } from "@react95/core";

const SignInPage = () => {
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
            <div className="px-5">
              적절하지 못한 닉네임일시 에러나 문구 메시지를 띄워주어야한다.
            </div>
            <div className="px-5">닉네임 자동추천이 존재하면 좋지 않을까</div>
          </div>
          <div>
            avatar 이미지 업로드
            <div className="px-5"><Button>Upload</Button></div>
            <div className="px-5">기본 아바타 이미지가 있어야한다.</div>
            <div className="px-5">
              파일의 종류, 사이즈 제한이 있고 그에 맞는 파일만 업로드 되도록
              해야한다.
            </div>
          </div>
        </div>
        <LinkButton to="/menu" > Sign - in </LinkButton>
      </Window>
    </div>
  );
};

export default SignInPage;
