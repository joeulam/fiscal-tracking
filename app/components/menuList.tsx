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
      label: "Dashboard",
      icon: <MailOutlined />,
      onClick: () => router.push("/homepage"),
    },
    {
      key: "sub2",
      label: "Transaction",
      icon: <AppstoreOutlined />,
      onClick: () => router.push("/transaction"),
    },
    {
      key: "sub3",
      label: "TBD",
      icon: <AppstoreOutlined />,
    },
    {
      key: "sub4",
      label: "Settings",
      icon: <AppstoreOutlined />,
      onClick: () => router.push("/settings"),
    },
  ];
  return (
    <>
      <Menu
        style={{ width: 256 }}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default MenuList;
