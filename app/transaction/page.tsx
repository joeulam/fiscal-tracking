'use client'
import { LineChart } from "@mantine/charts";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { monthlySpending, Transaction } from "../functions/transaction_functions";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import dayjs from "dayjs";
import { Skeleton } from "antd";
import '@mantine/core/styles/global.css';
import "@mantine/charts/styles.css";

export default function TransactionPage() {
  const { user, isLoading, } = useUser();
  const [historicalTransaction, setHistoricalTransaction] = useState<{date: string; "Total spending": number}[]>([]);
  const [loading, setLoading] = useState(true);

  async function getData(){
    if(!isLoading && user){
      const userData = await monthlySpending(user!)
      prepareChartData(userData.response.transactions)
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
        date: (dayjs(transaction.date).format('YYYY-MM-DD')), // Format date as ISO string
        "Total spending": cumulativeSum, // Cumulative sum up to this point
      };
    });
    setHistoricalTransaction(chartData);
    setLoading(false)
  }

  useEffect(() => {
    if (!isLoading && user) {
      getData();
    }
  }, [isLoading, user]); 

  return(
    <MantineProvider defaultColorScheme={"light"}>
      <ColorSchemeScript defaultColorScheme="light" />

      transaction page in question
      {loading ? (
        <Skeleton.Node active style={{ textAlign: "center"}}>
          <div style={{ width: "50%"}}>
            Fetching data
          </div>
        </Skeleton.Node>
      ) : (
        <LineChart
          style={{ width: "50%" }} 
          h={300}
          data={historicalTransaction}
          dataKey="date"
          series={[
            { name: "Total spending", color: "indigo.6" },
          ]}
          curveType="linear"
          connectNulls
        />
      )}
    </MantineProvider>
  )
}
