'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { getRecentTransactions } from './mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reqData = await req.body
    const userID = reqData.userID
    const response = await getRecentTransactions(userID)
    res.status(200).json({ response });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error", details: error });
  }
}