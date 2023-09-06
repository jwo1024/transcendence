// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type User42Dto = {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  campus: string;
};

const user42Dto: User42Dto = {
  id: 98123,
  login: "jiwolee",
  email: "jiwolee@student.42seoul.kr",
  first_name: "Jiwoo",
  last_name: "Lee",
  campus: "Seoul",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // send full url to frontend in text format
  if (req.method === "GET") {
    res.status(200).json(user42Dto);
  } else if (req.method === "POST") {
    console.log("req.body", req.body);
    res.status(200).json({ message: "OK" });
  } else {
    res.status(402).json({ message: "Not Found" });
  }
}
