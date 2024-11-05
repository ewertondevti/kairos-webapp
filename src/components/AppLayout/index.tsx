import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { Outlet } from "react-router-dom";
import { CustomHeader } from "../CustomHeader";
import "./AppLayout.scss";

const AppLayout = () => {
  return (
    <Layout className="layout__app">
      <CustomHeader />

      <Content className="layout__app-content">
        <Title>Galeria</Title>

        <Outlet />
      </Content>
    </Layout>
  );
};

export default AppLayout;
