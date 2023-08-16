import React, { FC } from "react";
import styled from "styled-components";

import { Frame } from "@react95/core";

const NameTag = styled.span`
  color: white;
  text-decoration: bold;
  margin-left: 5px;
  padding: 1px 12px 1px 12px;
  background-color: rgb(120 113 108);
  border-radius: 5px;
`;

interface MessageBoxProps {
  message?: string[];
}
// id

const MessageBox: FC<MessageBoxProps> = ({ message }) => {
  return (
    <Frame
      // id={id}
      className="flex flex-col flex-1 overflow-y-scroll scroll-behavior-smooth p-2"
      h=""
      boxShadow="in"
      bg="white"
    >
      {/* <Frame className="h-full" boxShadow="in" bg="white"> */}
      <div className="p-0.5">
        <span className="mx-1 my-2 bg-stone-200 p-1 rounded">방제</span>
        <span className="mx-1 my-2 bg-stone-200 p-1 rounded">공개방</span>
        <span className="mx-1 my-2 bg-stone-200 p-1 rounded">비밀번호 없음</span>
      </div>
      {message?.map((message, index) => {
        return (
          // message overflow 처리하기
          <div className=" bg-stone-300 m-0.5 rounded" key={index}> 
            <NameTag>name</NameTag> {``}
              <span className="">{message}</span>
              <span className="text-sm m-1 text-gray-100 ml-2">22.22.22 22:22:22</span>
          </div>
        );
      })}
      {/* </Frame> */}
    </Frame>
  );
};

export default MessageBox;
