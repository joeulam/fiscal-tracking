'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { editTransaction } from './mongodb';
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reqData = await req.body
    const userID = reqData.userID
    const name = reqData.transactionName
    const cost = reqData.transactionCost
    const date = reqData.transactionDate
    const description = reqData.transactionDescription
    const transactionID = reqData.transactionID
    editTransaction(userID,name,cost,date,transactionID,description)
    // doesUsernameExist(userID) // keep for future username check for those who signup via social auth
    res.status(200).json({ });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error", details: error });
  }
}
