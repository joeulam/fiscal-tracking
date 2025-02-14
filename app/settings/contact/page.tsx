"use client";
import React from "react";
import {Card} from "antd";
import SettingsList from "../../components/settingsList";
import Image from "next/image";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import {Button, TextField} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import emailjs from '@emailjs/browser';

export default function aboutPage()
{
  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const result = await emailjs.sendForm('service_dra1wfr', 'template_vjsmswd', e.target as HTMLFormElement, '8_eXVsC7tdstx-Cpn');
      console.log("Email sent successfully:", result.text);
      alert("Email sent successfully!");
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
              <form onSubmit={sendEmail}>
                  <label htmlFor="email_from" style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    Your Email:
                  </label>
                  <TextField
                    type="email"
                    id="emailfrom"
                    name="email_from"
                    placeholder="Enter your email"
                    variant="outlined"
                    fullWidth
                    required
                    sx={{ marginBottom: "15px" }}
                  />

                  <label htmlFor="message" style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    Message:
                  </label>
                  <TextField
                    id="message"
                    name="message"
                    placeholder="Enter your message"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    required
                    sx={{ marginBottom: "20px" }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    sx={{
                      backgroundColor: "#ff6600",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#cc5500" },
                    }}
                  >
                    Send
                  </Button>
                </form>
            </Card>
            </MantineProvider>
        </div>
        </div>
        </>
      )
}