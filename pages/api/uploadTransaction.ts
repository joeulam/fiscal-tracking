'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { insertTransaction } from './mongodb';
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reqData = await req.body
    const userID = reqData.userID
    const name = reqData.transactionName
    const cost = reqData.transactionCost
    const date = reqData.transactionDate
    const description = reqData.transactionDescription
    insertTransaction(userID, name, cost, date, description);
    res.status(200).json({ });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error", details: error });
  }
}
