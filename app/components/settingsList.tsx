"use client";
import React from "react";
import { AppstoreOutlined, MailOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useRouter } from "next/navigation";

type MenuItem = Required<MenuProps>["items"][number];

const MenuList: React.FC = () => {
  const router = useRouter();
  const items: MenuItem[] = [
    {
      key: "sub1",
      label: "Account",
      icon: <MailOutlined />,
      onClick: () => router.push("/settings/account"),
    },
    {
      key: "sub2",
      label: "Appearance",
      icon: <AppstoreOutlined />,
      onClick: () => router.push("/settings/appearance"),
    },
    {
      key: "sub3",
      label: "Contact Us",
      icon: <AppstoreOutlined />,
      onClick: () => router.push("/settings/contact"),
    },
    {
      key: "sub4",
      label: "About",
      icon: <AppstoreOutlined />,
      onClick: () => router.push("/settings/about"),
    },
    {
      key: "sub5",
      label: "Return",
      icon: <AppstoreOutlined />,
      onClick: () => router.push("/homepage"),
    },
  ];
  return (
    <>
      <Menu
        {...{ style: { width: 256 } }}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={items}
        />
    </>
  );
};

export default MenuList;
