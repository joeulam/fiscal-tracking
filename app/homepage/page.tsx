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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { ObjectId } from "mongodb";
import {
  uploadEditedTranscation,
  uploadTranscation,
} from "../functions/transaction_functions";

type Transaction = {
  // Transaction class
  _id: ObjectId;
  name: string;
  cost?: number;
  date?: Dayjs;
  description?: string;
};

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionEdit, setTransactionEdit] = useState(false);
  const [currentTransactionID, setCurrentTransactionID] = useState<ObjectId>();
  const [currentTransactionCost, setcurrentTransactionCost] = useState(0);
  const [monthlySpendingAmount, setMonthlySpending] = useState(0);
  const [monthlySpendingLoading, setMonthlySpendingLoading] = useState(true);
  const [historicalTransaction, setHistoricalTransaction] = useState<
    Transaction[]
  >([]);
  const { user, error, isLoading } = useUser();
  const [form] = Form.useForm<Transaction>(); // Store transaction data

  // * -------------------- Modal popup control
  const showModal = (editTransaction: boolean) => {
    setTransactionEdit(editTransaction);
    setIsModalOpen(true);
  };

  const handleOk = async (editTransaction: boolean) => {
    const values = await form.validateFields();
    if (editTransaction) {
      const response = await uploadEditedTranscation(
        values,
        user!,
        currentTransactionID!
      );
      if (response.success) {
        successTransaction();
        setMonthlySpending(
          monthlySpendingAmount - currentTransactionCost + values.cost!
        );
        setHistoricalTransaction([
          values,
          ...historicalTransaction.filter(
            (index) => index._id !== currentTransactionID
          ),
        ]);
        form.resetFields();
        successTransaction();
        setTransactionEdit(false);
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
        form.resetFields();
      } else {
        console.error("Upload failed:", response.message);
        failed();
      }
    }
    setHistoricalTransaction([values, ...historicalTransaction]);
    setMonthlySpending(monthlySpendingAmount + values.cost!);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setTransactionEdit(false);
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

  const monthlySpending = async () => {
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
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const jsonDetail = await response.json();
        setHistoricalTransaction(jsonDetail.response.transactions);
        setMonthlySpending(
          jsonDetail.response.transactions
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
    } catch (err) {
      failed();
      console.error("Error uploading data:", err);
    }
  };

  const editTransaction = (transactionCard: Transaction) => {
    form.setFieldsValue({
      ...transactionCard,
      date: dayjs(transactionCard.date),
    });
    setCurrentTransactionID(transactionCard._id);
    setcurrentTransactionCost(transactionCard.cost!);
    setTransactionEdit(true);
    showModal(true);
  };

  useEffect(() => {
    if (!isLoading && user) {
      // Ensure data fetching happens only when not loading and user is available
      const fetchData = async () => {
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
            await monthlySpending();
          }
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };

      fetchData();
    }
  }, [isLoading, user]); // Add dependencies to run the effect properly

  if (isLoading) {
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
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>; // Handle error state
  }

  return user ? (
    <div>
      {contextHolder}
      <img className="w-40 h-38" src="calicoWDiscription.png" />
      <img src={user.picture!} alt={user.name!} />
      <h2>{user.nickname}</h2>
      <p>{user.email}</p>
      <FloatButton onClick={() => showModal(false)} icon={<PlusOutlined />}>
        Add transaction
      </FloatButton>
      <div>
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
        <List
          itemLayout="horizontal"
          dataSource={historicalTransaction}
          renderItem={(item) => (
            <Card>
              <List.Item
                actions={[
                  <a
                    onClick={() => editTransaction(item)}
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
      </div>
      <Button>
        <a href="/api/auth/logout">Logout</a>
      </Button>

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
            <InputNumber prefix="$" placeholder="0" controls />
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
  ) : (
    <p>No user information available</p> // Handle the case where user is not defined
  );
}
