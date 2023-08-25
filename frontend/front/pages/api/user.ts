// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type User = {
  name: string;
  age?: number;
};

type Users = {
  users: User[];
};

const users: Users = {
  users: [
    {
      name: "Jchoi",
      age: 25,
    },
    {
      name: "Ji Woo",
      age: 24,
    },
    {
      name: "John Doe",
      age: 21,
    },
    {
      name: "Smith",
      age: 24,
    },
  ],
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Users>
) {
  res.status(200).json(users);
}
