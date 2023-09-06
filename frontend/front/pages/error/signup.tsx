import { Button } from "@react95/core";
import Window from "@/components/common/Window";
import { useRouter } from "next/router";

const Error_SignUp = () => {
  const router = useRouter();
  const errorMsg = router.query.error;
  const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_URL;

  const handleClick = () => {
    router.push(frontendURL ? frontendURL : "http://localhost:3001");
  };

  return (
    <div className="w-full h-full items-center pt-11 ">
      <Window title="pong game" w="300" h="300" className="">
        <div className="pt-16 text-center">
          <span className=" font-bold text-3xl"> SignUp Error</span>
          <br />
          {errorMsg ? (
            <span className=" text-lg">
              {` : `}
              {errorMsg}
            </span>
          ) : null}
          <br />
          <br />
          <Button onClick={handleClick}> {`=>`} Home </Button>
        </div>
      </Window>
    </div>
  );
};

export default Error_SignUp;
