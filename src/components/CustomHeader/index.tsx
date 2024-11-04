import { Flex } from "antd";
import { Header } from "antd/es/layout/layout";
import AppLogo from "/kairos-logo.png";

export const CustomHeader = () => {
  return (
    <Header>
      <Flex align="center" style={{ height: "100%" }}>
        <img src={AppLogo} height={50} width={50} />
      </Flex>
    </Header>
  );
};
