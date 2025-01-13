'use client'
import { LineChart } from "@mantine/charts";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { monthlySpending, Transaction } from "../functions/transaction_functions";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import dayjs from "dayjs";
import { Card, List, Skeleton } from "antd";
import '@mantine/core/styles/global.css';
import "@mantine/charts/styles.css";

export function sortByDate(order: string, historicalTransaction: Transaction[]){
  if(order === "new_to_old"){
    const sortedTransactions = historicalTransaction.sort(
      (a, b) => a.date!.valueOf() - b.date!.valueOf()
    );
    return sortedTransactions;
  }
}

export default function TransactionPage() {
  const { user, isLoading, } = useUser();
  const [historicalSpending, sethistoricalSpending] = useState<{date: string; "Total spending": number}[]>([]);
  const [historicalTransaction, setHistoricalTransaction] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function getData(){
    if(!isLoading && user){
      const userData = await monthlySpending(user!)
      setHistoricalTransaction(userData.response.transactions)
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
    sethistoricalSpending(chartData);
    setLoading(false)
  }

  useEffect(() => {
    if (!isLoading && user) {
      getData();
      setHistoricalTransaction(sortByDate("new_to_old", historicalTransaction)!);
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
        <>
        
        <LineChart
          style={{ width: "50%" }} 
          h={300}
          data={historicalSpending}
          dataKey="date"
          series={[
            { name: "Total spending", color: "indigo.6" },
          ]}
          curveType="linear"
          connectNulls
        />
        
        
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
        </>
        
        
      )}
    </MantineProvider>
  )
}
