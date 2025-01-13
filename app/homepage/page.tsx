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
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import {
  monthlySpending,
  Transaction,
  uploadEditedTranscation,
  uploadTranscation,
  userExist,
} from "../functions/transaction_functions";
import { useRouter } from "next/navigation";



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

  // * -------------------- Modal popup control
  const showModal = (editTransaction: boolean) => {
    setIsTransactionEdit(editTransaction);
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
        setMonthlySpendingAmount(
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
        form.resetFields();
      } else {
        console.error("Upload failed:", response.message);
        failed();
      }
    }
    setHistoricalTransaction([values, ...historicalTransaction]);
    setMonthlySpendingAmount(monthlySpendingAmount + values.cost!);
    setIsModalOpen(false);
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
    const response = await userExist(user!)
    if(response?.success){
      const userData = await monthlySpending(user!)
      const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        setHistoricalTransaction(userData.response.transactions);
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
  }
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

  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Ensure data fetching happens only when not loading and user is available
      fetchUserData()
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
                    onKeyDown={() => editTransaction(item)}
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
      
      
      <Button onClick={() => router.push('/transaction')}>Transaction page</Button>

    </div>
  ) : (
    <p>No user information available</p> // Handle the case where user is not defined
  );
}
