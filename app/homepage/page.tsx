"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Card,
  Col,
  DatePicker,
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
  Typography,
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
import MenuList from "../components/menuBar";

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
  const { Text } = Typography;

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
    if (!isLoading && user) {
      const userData = await monthlySpending(user!);
      setHistoricalTransaction(
        sortByDate("new_to_old", userData.response.transactions)!
      );
      prepareChartData(userData.response.transactions);
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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Sidebar */}
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
  
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflow: 'auto' }}>
        <ColorSchemeScript defaultColorScheme="light" />
        {contextHolder}
        <FloatButton onClick={() => showModal(false)} icon={<PlusOutlined />}>
          Add transaction
        </FloatButton>
        <div>
          <Text>Welcome back {user.nickname}</Text>
          <Row gutter={16}>
            <Col span={12}>
              {monthlySpendingLoading ? (
                <Card bordered={false}>
                  <Skeleton active paragraph={false} />
                </Card>
              ) : (
                <Card bordered={false}>
                  <Statistic
                    title="Current monthly spending"
                    value={monthlySpendingAmount}
                    precision={2}
                    suffix="$"
                  />
                </Card>
              )}
            </Col>
          </Row>
        </div>
        <div>
          <MantineProvider defaultColorScheme={"light"}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "20px",
                padding: "20px",
              }}
            >
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
                <List
                  itemLayout="horizontal"
                  dataSource={historicalTransaction}
                  renderItem={(item) => (
                    <Card>
                      <List.Item
                        actions={[
                          <a
                            onClick={() => editTransaction(item)}
                            onKeyDown={() => editTransaction(item)}
                            key="list-loadmore-edit"
                          >
                            edit
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
              </div>
            </div>
          </MantineProvider>
        </div>
  
        <Button>
          <a href="/api/auth/logout">Logout</a>
        </Button>
  
        {modalLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : null}
  
        <Modal
          title="New transaction"
          open={isModalOpen}
          onOk={() => handleOk(isTransactionEdit)}
          onCancel={handleCancel}
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
  
        <Button onClick={() => router.push("/transaction")}>
          Transaction page
        </Button>
      </div>
    </div>
  ) : (
    <p>No user information available</p>
  );
  
}
