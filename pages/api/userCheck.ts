'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { doesUserExist } from './mongodb';
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reqData = await req.body
    const userID = reqData.userId
    const userName = reqData.userName
    const emailAddress = reqData.emailAddress
    doesUserExist(userID, userName, emailAddress);
    // doesUsernameExist(userID) // keep for future username check for those who signup via social auth
    res.status(200).json({ });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error", details: error });
  }
}
