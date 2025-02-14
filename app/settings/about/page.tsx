import React from "react";
import {Card} from "antd";
import SettingsList from "../../components/settingsList";
import Image from "next/image";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

export default function aboutPage()
{
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
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                marginBottom: "50px",
              }}
            >
              <h1 style={{ marginBottom: "30px", color: "#ff6600", textAlign: "center", textDecoration: "bold", fontSize: "30px"}}>
                Founders: Joey Lam, Daniel George, Casey ______, James Liu
              </h1>
              <>
                <h2 style={{ marginBottom: "30px", color: "#333", textAlign: "center", fontSize:"15px"}}>
                  We are four aspiring software engineers at Boston University with a passion for making cool stuff.  We also realized how tedious it can be to keep track of your finances and transactions and how scary it can be, so we decided to create a cute twist so that budgeting does not have to be all lions, tigers, and bears (oh my!)
                </h2>
              </>
              <>
              </>
            </Card>
            </MantineProvider>
            <MantineProvider defaultColorScheme="light">

          <Card
              className="p-[5px] md:p-[20px]"
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
                <h1 style={{ marginBottom: "30px", color: "#ff6600", textAlign: "center", textDecoration: "bold", fontSize: "30px"}}>
                  Check out our other stuff!
                </h1>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: "2rem"}}>
                  <a href="https://joeyresume.vercel.app/" target="_blank">Joey</a>
                  <a href="https://diggygeorge.github.io/" target="_blank">Daniel</a>
                  <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">Casey</a>
                  <a href="https://jamesnolastname.github.io/Portfolio/#" target="_blank">James</a>
                </div>
            </Card>
            </MantineProvider>
        </div>
        </div>
        </>
      )
}