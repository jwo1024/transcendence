// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type friend = {
  nickname: string;
  state: string;
  avatarSrc: string;
  ladder: number;
  win: number;
  lose: number;
};

type friends = friend[];

const friendList: friends = [
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Jchoi",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1200,
    win: 3,
    lose: 1,
  },
  {
    nickname: "Ji Woo",
    state: "게임중",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1050,
    win: 1,
    lose: 1,
  },
  {
    nickname: "John Doe",
    state: "온라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 1000,
    win: 0,
    lose: 1,
  },
  {
    nickname: "Smith",
    state: "오프라인",
    avatarSrc: "https://github.com/React95.png",
    ladder: 990,
    win: 0,
    lose: 2,
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<friends>
) {
  res.status(200).json(friendList);
}
