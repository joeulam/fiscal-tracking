import { UserProfile } from "@auth0/nextjs-auth0/client";
import dayjs, { Dayjs } from "dayjs";
import { ObjectId } from "mongodb";

export type Transaction = {
  // Transaction class
  _id: ObjectId;
  name: string;
  cost?: number;
  date?: Dayjs;
  description?: string;
};
// Uploads transactions to mongodb
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
    return {
      success: false,
      message: (err as Error).message || "Unknown error occurred",
    };
  }
};

// Uploads / edits transactions and sends to mongodb
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
    return {
      success: false,
      message: (err as Error).message || "Unknown error occurred",
    };
  }
};

// Gets the userTransaction
export const monthlySpending = async (user: UserProfile) => {
  // Rename this function later - Joey
  try {
    const response = await fetch("/api/getUserTransaction", {
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
      return jsonDetail;
    }
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || "Unknown error occurred",
    };
  }
};

// Checks if the user exist on mongoDB
export const userExist = async (user: UserProfile) => {
  try {
    const response = await fetch("/api/userCheck", {
      // Applies check to whether or not the user mongoDB exist or not
      method: "POST",
      body: JSON.stringify({
        userId: user?.sub!.toString().split("|")[1],
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
      return { success: true };
    }
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || "Unknown error occurred",
    };
  }
};

// Sorts transaction by date
export function sortByDate(
  order: string,
  historicalTransaction: Transaction[]
): Transaction[] {
  if (!historicalTransaction || historicalTransaction.length === 0 || historicalTransaction == null) {
    console.log("No transactions to sort.");
    return [];
  }
  const sortedTransactions = [...historicalTransaction].sort((a, b) => {
    if (!a.date || !b.date) {
      return 0;
    }
    const dateA = dayjs(a.date);
    const dateB = dayjs(b.date);
    
    return order === "new_to_old"
      ? dateB.valueOf() - dateA.valueOf() // Descending
      : dateA.valueOf() - dateB.valueOf(); // Ascending
  });
  return sortedTransactions;
}
