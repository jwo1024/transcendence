// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

const base_url = "https://api.intra.42.fr/oauth/authorize";
const client_id =
  "u-s4t2ud-470369c0daf58a7a5e782ee901a01d0aaf7b9e940710ad5113fa2d2058d6d9f5";
const redirect_uri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/login/`; // Update the redirect URL accordingly
const scope = "public";
const full_url = `${base_url}?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // send full url to frontend in text format
  res.status(200).send(full_url);
}
