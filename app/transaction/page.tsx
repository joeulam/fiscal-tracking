"use client";
import { LineChart } from "@mantine/charts";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import {
  monthlySpending,
  Transaction,
} from "../functions/transaction_functions";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import dayjs from "dayjs";
import { Button, Card, List, Spin } from "antd";
import "@mantine/core/styles/global.css";
import "@mantine/charts/styles.css";
import { useRouter } from "next/navigation";

export function sortByDate(
  order: string,
  historicalTransaction: Transaction[]
): Transaction[] {
  if (!historicalTransaction || historicalTransaction.length === 0) {
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

export default function TransactionPage() {
  const { user, isLoading } = useUser();
  const [historicalSpending, sethistoricalSpending] = useState<
    { date: string; "Total spending": number }[]
  >([]);
  const [historicalTransaction, setHistoricalTransaction] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);

  async function getData() {
    if (!isLoading && user) {
      const userData = await monthlySpending(user!);
      setHistoricalTransaction(
        sortByDate("new_to_old", userData.response.transactions)!
      );
      prepareChartData(userData.response.transactions);
    }
  }

  function prepareChartData(transactions: Transaction[]) {
    // Sort transactions by date (ascending)
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.date!.valueOf() - b.date!.valueOf()
    );
    let cumulativeSum = 0;
    const chartData = sortedTransactions.map((transaction) => {
      cumulativeSum += transaction.cost || 0; // Add cost to cumulative sum
      return {
        date: dayjs(transaction.date).format("YYYY-MM-DD"), // Format date as ISO string
        "Total spending": cumulativeSum, // Cumulative sum up to this point
      };
    });
    sethistoricalSpending(chartData);
    setLoading(false);
  }

  const router = useRouter();
  useEffect(() => {
    if (!isLoading && user) {
      getData();
      console.log(historicalTransaction);
    }
  }, [isLoading, user]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column", // Stack items vertically
          height: "100vh", // Full screen height
          width: "100vw", // Full screen width
        }}
      >
        <ColorSchemeScript defaultColorScheme="light" />
        <Spin size="large" />
        <div style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
          Fetching Data
        </div>
      </div>
    );
  }

  return (
    <MantineProvider defaultColorScheme={"light"}>
      <div style={{ margin: 20 }}>
        transaction page in question
        <LineChart
          style={{ width: "50%" }}
          h={300}
          data={historicalSpending}
          dataKey="date"
          series={[{ name: "Total spending", color: "indigo.6" }]}
          curveType="linear"
          connectNulls
        />
        Recent Transactions
        <List
          itemLayout="horizontal"
          dataSource={historicalTransaction}
          renderItem={(item) => (
            <Card>
              <List.Item
                actions={[
                  <a
                    // onClick={() => editTransaction(item)}
                    // onKeyDown={() => editTransaction(item)}
                    key="list-loadmore-edit"
                  >
                    edit
                  </a>,
                ]} // Make it popup modal and edit from there
              >
                <List.Item.Meta
                  title={item.name} // Change so it dynamically updates with transaction
                  description={"$" + item.cost} // Change so it dynamically updates with transaction
                />
              </List.Item>
            </Card>
          )}
        />
        <Button onClick={() => router.push("/homepage")}>Dashboard</Button>
      </div>
    </MantineProvider>
  );
}
