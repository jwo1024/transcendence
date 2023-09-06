// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type ChatRoom = {
  id: number;
  title : string;
  is_public: boolean;
  have_password: boolean;
  num_of_user: number;
};

type ChatRoomList = {
  list: ChatRoom[];
};

const chatRoomList: ChatRoomList = {
  list: [
    {
      id: 1,
      title: "api_test",
      is_public: true,
      have_password: false,
      num_of_user : 3,
    },
    {
      id: 2,
      title: "api_test2",
      is_public: true,
      have_password: true,
      num_of_user : 5,
    },
    {
      id: 3,
      title: "api_test3",
      is_public: true,
      have_password: false,
      num_of_user : 2,
    },

  ],
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatRoomList>
) {
  res.status(200).json(chatRoomList);
}
