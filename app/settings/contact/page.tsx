"use client";
import React from "react";
import { useForm } from 'antd/es/form/Form';
import {Card, Form, Button, Input} from "antd";
import { SendOutlined } from '@ant-design/icons';
import SettingsList from "../../components/settingsList";
import Image from "next/image";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import emailjs from '@emailjs/browser';

export default function aboutPage()
{
  const [form] = useForm(); // ✅ Use Ant Design's useForm() instead of useRef()

  const sendEmail = async () => {
    try {
      const values = await form.validateFields(); // ✅ Get form values properly
      const formElement = document.createElement('form'); // Create a temporary form element

      // Append form values as hidden input fields
      Object.keys(values).forEach((key) => {
        const input = document.createElement('input');
        input.name = key;
        input.value = values[key];
        formElement.appendChild(input);
      });

      const result = await emailjs.sendForm(
        'service_dra1wfr', 
        'template_vjsmswd', 
        formElement, // ✅ Use dynamically created form
        '8_eXVsC7tdstx-Cpn'
      );

      console.log("Email sent successfully:", result.text);
      alert("Email sent successfully!");
      form.resetFields(); // ✅ Reset form after sending
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

    return(
        <>
        <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f8f9fa" }}>
            {/* Left Sidebar */}
            <div
              style={{
                flexDirection: "column",
                alignItems: "center",
                width: 256,
                backgroundColor: "#ffffff",
                boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
                padding: "20px",
              }}
              className="md:flex hidden"
              >
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Image
                  src="/calicoWDiscription.png"
                  alt="Logo"
                  width={150}
                  height={150}
                  style={{
                    marginBottom: "10px",
                  }}
                />
              </div>
              <div>
              <SettingsList />
              </div>
            </div>
            {/* Main Content */}
        <div className={"md:p-[40px] p-[10px]"} style={{ flex: 1, overflow: "auto" }}>
          <ColorSchemeScript defaultColorScheme="light" />
          {/* About Me */}
          <MantineProvider defaultColorScheme="light">

          <Card
              className="p-[5px] md:p-[20px]"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                margin: "auto",
                padding: "20px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                marginBottom: "50px",
              }}
            >
                  <Form layout="vertical" onFinish={sendEmail}>
                    <Form.Item 
                      label="Your Email" 
                      name="email_from" 
                      rules={[{ required: true, message: 'Please enter your email' }]}
                    >
                      <Input type="email" placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item 
                      label="Message" 
                      name="message" 
                      rules={[{ required: true, message: 'Please enter your message' }]}
                    >
                      <Input.TextArea rows={4} placeholder="Enter your message" />
                    </Form.Item>

                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SendOutlined />} 
                      style={{ backgroundColor: "#ff6600", borderColor: "#ff6600" }}
                    >
                      Send
                    </Button>
                  </Form>
            </Card>
            </MantineProvider>
        </div>
        </div>
        </>
      )
}