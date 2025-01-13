import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Dayjs } from "dayjs";
import { ObjectId } from "mongodb";

export type Transaction = {
  // Transaction class
  _id: ObjectId;
  name: string;
  cost?: number;
  date?: Dayjs;
  description?: string;
};
export const uploadTranscation = async (
  transaction: Transaction,
  user: UserProfile
) => {
  try {
    const response = await fetch("/api/uploadTransaction", {
      // Applies check to whether or not the user mongoDB exist or not
      method: "POST",
      body: JSON.stringify({
        userID: user?.sub!.toString().split("|")[1],
        transactionID: transaction._id,
        transactionName: transaction.name,
        transactionCost: transaction.cost,
        transactionDate: transaction.date,
        transactionDescription: transaction.description,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (!response.ok) {
      // Extract error message from response if available
      const error = await response.json();
      throw new Error(error?.message || "Failed to upload transaction");
    }
    return { success: true, message: "Transaction uploaded successfully" };
  } catch (err: unknown) {
    console.error("Error uploading data:", err);
    return { success: false, message: (err as Error).message || "Unknown error occurred" };
  }
};

export const uploadEditedTranscation = async (
  transaction: Transaction,
  user: UserProfile,
  currentTransactionID: ObjectId
) => {
  try {
    const response = await fetch("/api/editTransaction", {
      // Applies check to whether or not the user mongoDB exist or not
      method: "POST",
      body: JSON.stringify({
        userID: user?.sub!.toString().split("|")[1],
        transactionName: transaction.name,
        transactionCost: transaction.cost,
        transactionDate: transaction.date,
        transactionDescription: transaction.description,
        transactionID: currentTransactionID,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (!response.ok) {
      // Extract error message from response if available
      const error = await response.json();
      throw new Error(error?.message || "Failed to upload transaction");
    }
    return { success: true, message: "Transaction uploaded successfully" };
  } catch (err: unknown) {
    console.error("Error uploading data:", err);
    return { success: false, message: (err as Error).message || "Unknown error occurred" };
  }
};



export const monthlySpending = async (user: UserProfile) => {
  // Move this to the transaction page
  try {
    const response = await fetch("/api/getUserTransaction", {
      // Applies check to whether or not the user mongoDB exist or not
      method: "POST",
      body: JSON.stringify({
        userID: user?.sub!.toString().split("|")[1],
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response.ok) {
      const jsonDetail = await response.json();
        return jsonDetail
    }
  } catch (err) {
    return { success: false, message: (err as Error).message || "Unknown error occurred" };
  }
};



export const userExist = async (user: UserProfile) => {
  try {
    const response = await fetch("/api/userCheck", {
      // Applies check to whether or not the user mongoDB exist or not
      method: "POST",
      body: JSON.stringify({
        userId: user?.sub,
        userName: user?.nickname,
        emailAddress: user?.email,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    } else {
      return { success: true};    }
  } catch (err) {
    return { success: false, message: (err as Error).message || "Unknown error occurred" };
  }
};