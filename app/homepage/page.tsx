'use client'
import React, { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button, Card, Col, DatePicker, FloatButton, Form, Input, InputNumber, List, message, Modal, Row, Skeleton, Spin, Statistic } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';

type Transaction = { // Transaction class
    name: string;
    cost?: number;
    date?: Dayjs;
    description?: string;
};

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlySpendingAmount, setMonthlySpending] = useState(0);
  const [monthlySpendingLoading, setMonthlySpendingLoading] = useState(true);
  const [historicalTransaction, setHistoricalTransaction] = useState<Transaction[]>([]);
  const { user, error, isLoading } = useUser();
	const [form] = Form.useForm<Transaction>(); // Store transaction data

  // * -------------------- Modal popup control
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk= async () => {
		const values = await form.validateFields();
    uploadTranscation(values);
    setHistoricalTransaction([values, ...historicalTransaction]);
    setMonthlySpending(monthlySpendingAmount + values.cost!);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // * -------------------- Modal popup control
  const uploadTranscation = async (transaction: Transaction) => {
    try {
        const response = await fetch("/api/uploadTransaction", { // Applies check to whether or not the user mongoDB exist or not
          method: "POST",
          body: JSON.stringify({
						userID: user?.sub,
            transactionName: transaction.name,
            transactionCost: transaction.cost,
            transactionDate: transaction.date,
            transactionDescription: transaction.description
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        });
        if (!response.ok) {
          throw new Error("Failed to upload data");
        }
				successTransaction();
				form.resetFields();
				setIsModalOpen(false);
      } catch (err) {
				failed();
        console.error("Error uploading data:", err);
      }
  }
  const [messageApi, contextHolder] = message.useMessage();

  const successTransaction = () => { // Success notification - Might make it take a parameter instead so we can reuse it
    messageApi.open({
      type: 'success',
      content: 'Successfully added',
    });
  };

  const failed = () => { // Failure notification - Might make it take a parameter instead so we can reuse it
    messageApi.open({
      type: 'error',
      content: 'errmmm something went wrong',
    });
  };

  const monthlySpending = async () => {
    try {
      const response = await fetch("/api/getUserTransaction", { // Applies check to whether or not the user mongoDB exist or not
        method: "POST",
        body: JSON.stringify({
          userID: user?.sub,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      });
      if(response.ok){
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const jsonDetail = await response.json();
        setHistoricalTransaction(jsonDetail.response.transactions)
        setMonthlySpending(
          jsonDetail.response.transactions
            .filter((item: { date: string | number | Date; }) => {
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
  }
  useEffect(() => {
    if (!isLoading && user) { // Ensure data fetching happens only when not loading and user is available
      const fetchData = async () => {
        try {
          const response = await fetch("/api/userCheck", { // Applies check to whether or not the user mongoDB exist or not
            method: "POST",
            body: JSON.stringify({
              userId: user?.sub,
              userName: user?.nickname,
              emailAddress: user?.email
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
          });
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          else{
            await monthlySpending();
          }
          console.log(user);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };

      fetchData();
    }
  }, [isLoading, user]); // Add dependencies to run the effect properly

  if (isLoading) {
    return(
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh", // Full screen height
            width: "100vw", // Full screen width
          }}>
            <Spin size="large"/>
          </div>
    )}

  if (error) {
    return <p>Error: {error.message}</p>; // Handle error state
  }

  return (
    user ? (
      <div >
				{contextHolder}
        <img className="w-40 h-38" src='calicoWDiscription.png'/>
        <img src={user.picture!} alt={user.name!} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <FloatButton onClick={()=>showModal()} icon={<PlusOutlined />}>Add transaction</FloatButton>
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
                actions={[<a key="list-loadmore-edit">edit</a>]} // Make it popup modal and edit from there 
              >
                <List.Item.Meta
                  title={item.name} // Change so it dynamically updates with transaction
                  description={"$"+item.cost} // Change so it dynamically updates with transaction
                />
              </List.Item>
            </Card>
          )}
        />
        </div>
        <Button>
          <a href="/api/auth/logout">Logout</a>
        </Button>

        <Modal title="New transaction" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
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
                    rules={[{ required: true, message: 'Please input transaction name!' }]}
                    >
                    <Input />
                </Form.Item>

                <Form.Item<Transaction>
                    label="Cost"
                    name="cost"
                    rules={[{ required: true, message: 'Please input transaction cost!' }]}
                    >
                    <InputNumber
                    prefix="$"
                    placeholder="0"
                    controls
                    />
                </Form.Item>

                <Form.Item<Transaction>
                    label="Date"
                    name="date"
                    rules={[{ required: true, message: 'Please input transaction date!' }]}
                    >
                    <DatePicker/>
                </Form.Item>
                
                <Form.Item<Transaction>
                    label="Description"
                    name="description"
                    >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
      </div>
    ) : (
      <p>No user information available</p> // Handle the case where user is not defined
    )
  );
}
