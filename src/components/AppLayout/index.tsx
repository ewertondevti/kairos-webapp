"use client";

import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { CustomHeader } from "../CustomHeader";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout className="h-full overflow-hidden flex flex-col">
      <CustomHeader />
      <Content className="h-full overflow-auto flex-1">{children}</Content>
    </Layout>
  );
};

export default AppLayout;
