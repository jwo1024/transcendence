// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type friend = {
  nickname: string;
  state: string;
};

type friends = friend[];

const friendList: friends = [
  {
    nickname: "Jchoi",
    state: "온라인",
  },
  {
    nickname: "Ji Woo",
    state: "게임중",
  },
  {
    nickname: "John Doe",
    state: "온라인",
  },
  {
    nickname: "Smith",
    state: "오프라인",
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<friends>
) {
  res.status(200).json(friendList);
}
