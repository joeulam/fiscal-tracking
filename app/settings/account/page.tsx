import React from "react";
import {Card} from "antd";
import SettingsList from "../../components/settingsList";
import Image from "next/image";

export default function accountPage()
{
    return(
        <>
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
            <div         
            >
            <SettingsList />
    
            </div>
          </div>
          <Card
              className="p-[5px] md:p-[20px]"
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              >
          </Card>
        </>
      )
}