"use client";
import { LineChart } from "@mantine/charts";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import {
  monthlySpending,
  sortByDate,
  Transaction,
} from "../functions/transaction_functions";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import dayjs from "dayjs";
import { Button, Card, Divider, List, Skeleton, Spin } from "antd";
import "@mantine/core/styles/global.css";
import "@mantine/charts/styles.css";
import { useRouter } from "next/navigation";
import InfiniteScroll from 'react-infinite-scroll-component';
import MenuList from "../components/menuBar";

export default function TransactionPage() {
  const { user, isLoading } = useUser();
  const [historicalSpending, setHistoricalSpending] = useState<
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
        sortByDate("new_to_old", userData.response?.transactions)!
      );
      prepareChartData(userData.response?.transactions);
    }
  }

  function prepareChartData(transactions: Transaction[]) {
    // Sort transactions by date (ascending)
    if(transactions != null ){
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
      setHistoricalSpending(chartData);
    }
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
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '20px', padding: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 256}}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <img
            src="calicoWDiscription.png"
            alt="Logo"
            style={{
              width: '150px', // Adjust width as needed
              height: 'auto', // Maintain aspect ratio
              marginBottom: '10px', // Add space below the image
            }}
          />
        </div>
        <MenuList />
      </div>
        
        {/* Chart Section */}
        <div style={{ flex: 1 }}>
          <h2>Transaction Page</h2>
          <LineChart
            h={300}
            data={historicalSpending}
            dataKey="date"
            series={[{ name: "Total spending", color: "indigo.6" }]}
            curveType="linear"
            connectNulls
          />
        </div>

        {/* Recent Transactions Section */}
        <div style={{ flex: 1 }}>
          <h2>Recent Transactions</h2>
          <InfiniteScroll
            dataLength={historicalTransaction.length}
            next={getData}
            hasMore={historicalTransaction.length < 5}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
            scrollableTarget="scrollableDiv"
          >
        <List
            itemLayout="horizontal"
            dataSource={historicalTransaction}
            renderItem={(item) => (
              <Card>
                <List.Item
                  actions={[
                    <a
                      key="list-loadmore-edit"
                      onClick={() => console.log("Edit clicked", item)}
                    >
                      Edit
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={"$" + item.cost}
                  />
                </List.Item>
              </Card>
            )}
          />
      </InfiniteScroll>
          
        </div>
      </div>
      <Button onClick={() => router.push("/homepage")}>Dashboard</Button>
    </MantineProvider>

  );
}
