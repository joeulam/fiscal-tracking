"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  FloatButton,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Row,
  Skeleton,
  Spin,
  Statistic,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import {
  monthlySpending,
  sortByDate,
  Transaction,
  uploadEditedTranscation,
  uploadTranscation,
  userExist,
} from "../functions/transaction_functions";
import { useRouter } from "next/navigation";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { LineChart } from "@mantine/charts";

import "@mantine/core/styles/global.css";
import "@mantine/charts/styles.css";
import MenuList from "../components/menuList";
import InfiniteScroll from "react-infinite-scroll-component";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionEdit, setIsTransactionEdit] = useState(false);
  const [currentTransactionID, setCurrentTransactionID] = useState<ObjectId>();
  const [currentTransactionCost, setCurrentTransactionCost] = useState(0);
  const [monthlySpendingAmount, setMonthlySpendingAmount] = useState(0);
  const [monthlySpendingLoading, setMonthlySpendingLoading] = useState(true);
  const [historicalTransaction, setHistoricalTransaction] = useState<
    Transaction[]
  >([]);
  const { user, error, isLoading } = useUser();
  const [form] = Form.useForm<Transaction>(); // Store transaction data
  const [historicalSpending, setHistoricalSpending] = useState<
    { date: string; "Total spending": number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false); // New loading state

  // * -------------------- Modal popup control
  const showModal = (editTransaction: boolean) => {
    setIsTransactionEdit(editTransaction);
    setIsModalOpen(true);
  };

  const handleOk = async (editTransaction: boolean) => {
    setModalLoading(true); // Start loading spinner
    const values = await form.validateFields();
    if (editTransaction) {
      const response = await uploadEditedTranscation(
        values,
        user!,
        currentTransactionID!
      );
      if (response.success) {
        successTransaction();
        const updatedTransactions = [
          values,
          ...historicalTransaction.filter(
            (index) => index._id !== currentTransactionID
          ),
        ];
        setHistoricalTransaction(updatedTransactions);
        setMonthlySpendingAmount(
          monthlySpendingAmount - currentTransactionCost + values.cost!
        );
        prepareChartData(sortByDate("old_to_new", historicalTransaction)); // Refresh chart
        form.resetFields();
        setIsTransactionEdit(false);
      } else {
        console.error("Upload failed:", response.message);
        failed();
      }
      setIsModalOpen(false);
      setCurrentTransactionID(undefined);
    } else {
      const response = await uploadTranscation(values, user!);
      if (response.success) {
        successTransaction();
        const updatedTransactions = [values, ...historicalTransaction];
        setHistoricalTransaction(updatedTransactions);
        setMonthlySpendingAmount(monthlySpendingAmount + values.cost!);
        prepareChartData(sortByDate("old_to_new", historicalTransaction)); // Refresh chart
        form.resetFields();
      } else {
        console.error("Upload failed:", response.message);
        failed();
      }
    }
    setIsModalOpen(false);
    setModalLoading(false); // Stop loading spinner
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsTransactionEdit(false);
    form.resetFields();
  };
  // * -------------------- Modal popup control
  const [messageApi, contextHolder] = message.useMessage();

  const successTransaction = () => {
    // Success notification - Might make it take a parameter instead so we can reuse it
    messageApi.open({
      type: "success",
      content: "Successfully added",
    });
  };

  const failed = () => {
    // Failure notification - Might make it take a parameter instead so we can reuse it
    messageApi.open({
      type: "error",
      content: "errmmm something went wrong",
    });
  };

  const fetchUserData = async () => {
    const response = await userExist(user!);
    try {
      if (response?.success) {
        const userData = await monthlySpending(user!);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        setMonthlySpendingAmount(
          userData.response.transactions
            .filter((item: { date: string | number | Date }) => {
              const itemDate = new Date(item.date);
              return (
                itemDate.getMonth() === currentMonth &&
                itemDate.getFullYear() === currentYear
              );
            })
            .reduce((acc: number, item: Transaction) => acc + item.cost!, 0)
        );
        setMonthlySpendingLoading(false);
      }
    } catch {
      setMonthlySpendingLoading(false);
      setLoading(false); // Stop loading spinner
    }
    setLoading(false); // Stop loading spinner
  };
  const editTransaction = (transactionCard: Transaction) => {
    form.setFieldsValue({
      ...transactionCard,
      date: dayjs(transactionCard.date),
    });
    setCurrentTransactionID(transactionCard._id);
    setCurrentTransactionCost(transactionCard.cost!);
    setIsTransactionEdit(true);
    showModal(true);
  };

  async function getData() {
    try {
      if (!isLoading && user) {
        const userData = await monthlySpending(user!);
        setHistoricalTransaction(
          sortByDate("new_to_old", userData.response.transactions)!
        );
        prepareChartData(userData.response.transactions);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function prepareChartData(userData: Transaction[]) {
    let cumulativeSum = 0;
    const chartData = sortByDate("old_to_new", userData)!.map((transaction) => {
      cumulativeSum += transaction.cost || 0;
      return {
        date: dayjs(transaction.date).format("YYYY-MM-DD"),
        "Total spending": cumulativeSum,
      };
    });
    setHistoricalSpending(chartData);
    setLoading(false);
  }

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Ensure data fetching happens only when not loading and user is available
      fetchUserData();
      getData();
    }
  }, [isLoading, user]); // Add dependencies to run the effect properly
  if (isLoading || loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Full screen height
          width: "100vw", // Full screen width
        }}
      >
        <ColorSchemeScript defaultColorScheme="light" />
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>; // Handle error state
  }
  return user ? (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f8f9fa" }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 256,
          backgroundColor: "#ffffff",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <img
            src="calicoWDiscription.png"
            alt="Logo"
            style={{
              width: "150px",
              height: "auto",
              marginBottom: "10px",
            }}
          />
        </div>
        <MenuList />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", overflow: "auto" }}>
        <ColorSchemeScript defaultColorScheme="light" />
        {contextHolder}

        {/* Floating Button */}
        <FloatButton
          onClick={() => showModal(false)}
          icon={<PlusOutlined />}
          style={{
            backgroundColor: "#ff6600",
            color: "white",
            boxShadow: "0px 4px 8px rgba(255, 102, 0, 0.2)",
          }}
        >
          Add transaction
        </FloatButton>

        {/* Welcome Text */}
        <div
          style={{
            marginBottom: "20px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Welcome back,{" "}
          <span style={{ color: "#ff6600" }}>{user.nickname}</span>!
        </div>

        {/* Monthly Spending Card */}
        <Row gutter={16}>
          <Col span={12}>
            {monthlySpendingLoading ? (
              <Card
                bordered={false}
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  borderRadius: "10px",
                }}
              >
                <Skeleton active paragraph={false} />
              </Card>
            ) : (
              <Card
                bordered={false}
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  borderRadius: "10px",
                }}
              >
                <Statistic
                  title="Current Monthly Spending"
                  value={monthlySpendingAmount}
                  precision={2}
                  suffix="$"
                  style={{ color: "#333" }}
                />
              </Card>
            )}
          </Col>
        </Row>

        {/* Chart & Transactions Section */}
        <MantineProvider defaultColorScheme="light">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            {/* Chart Section */}
            <Card
              style={{
                flex: 1,
                padding: "20px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2 style={{ marginBottom: "10px", color: "#333" }}>
                Transaction Overview
              </h2>
              <LineChart
                h={300}
                data={historicalSpending}
                dataKey="date"
                series={[{ name: "Total spending", color: "#ff6600" }]}
                curveType="linear"
                connectNulls
              />
            </Card>

            <Card
              style={{
                flex: 1,
                padding: "20px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2 style={{ marginBottom: "10px", color: "#333" }}>
                Recent Transactions
              </h2>

              {/* Scrollable Container */}
              <div
                id="scrollableDiv"
                style={{
                  height: "400px",
                  overflow: "auto",
                  paddingRight: "10px",
                }}
              >
                <InfiniteScroll
                  dataLength={historicalTransaction.length} 
                  next={getData} 
                  hasMore={historicalTransaction.length < 20} 
                  loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                  endMessage={
                    <Divider plain>It is all, nothing more 🤐</Divider>
                  }
                  scrollableTarget="scrollableDiv" 
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={historicalTransaction}
                    renderItem={(item) => (
                      <Card
                        style={{
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <List.Item
                          actions={[
                            <a
                              onClick={() => editTransaction(item)}
                              onKeyDown={() => editTransaction(item)}
                              key="edit"
                              style={{ color: "#ff6600", fontWeight: "600" }}
                            >
                              Edit
                            </a>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <span
                                style={{ color: "#333", fontWeight: "500" }}
                              >
                                {item.name}
                              </span>
                            }
                            description={
                              <span style={{ color: "#666" }}>
                                ${item.cost}
                              </span>
                            }
                          />
                        </List.Item>
                      </Card>
                    )}
                  />
                </InfiniteScroll>
              </div>
            </Card>
          </div>
        </MantineProvider>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Button
            style={{
              backgroundColor: "#ff6600",
              color: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            <a href="/api/auth/logout">Logout</a>
          </Button>

          <Button
            onClick={() => router.push("/transaction")}
            style={{
              border: "1px solid #ff6600",
              color: "#ff6600",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Transaction Page
          </Button>
        </div>
        {modalLoading ? (
          <div
            style={{
              zIndex: 10,
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : null}
        {/* Modal for Adding Transactions */}
        <Modal
          title="New Transaction"
          open={isModalOpen}
          onOk={() => handleOk(isTransactionEdit)}
          onCancel={handleCancel}
          style={{ borderRadius: "10px" }}
        >
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            autoComplete="off"
          >
            <Form.Item<Transaction>
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please input transaction name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<Transaction>
              label="Cost"
              name="cost"
              rules={[
                { required: true, message: "Please input transaction cost!" },
              ]}
            >
              <InputNumber prefix="$" placeholder="0" precision={2} controls />
            </Form.Item>

            <Form.Item<Transaction>
              label="Date"
              name="date"
              rules={[
                { required: true, message: "Please input transaction date!" },
              ]}
            >
              <DatePicker />
            </Form.Item>

            <Form.Item<Transaction> label="Description" name="description">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  ) : (
    <p>No user information available</p>
  );
}
