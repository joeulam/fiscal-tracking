'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { doesUserExist, loadConnection } from './mongodb';
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reqData = await req.body
    const userID = reqData.userId
    const userName = reqData.userName
    const emailAddress = reqData.emailAddress
    doesUserExist(userID, userName, emailAddress);
    res.status(200).json({ });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error", details: error });
  }
}
