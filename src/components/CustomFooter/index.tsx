import { FacebookFilled, InstagramFilled } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import "./CustomFooter.scss";

const { Title, Text } = Typography;

export const CustomFooter = () => {
  return (
    <Flex vertical align="center" gap={8} className="footer">
      <img src="/kairos-logo.png" width={50} />
      <Title level={5}>Igreja Kairós Portugal</Title>
      <Text>Rua da Papoila 14, 2135-085 Samora Correia</Text>
      <Flex gap={8} justify="center">
        <Button
          shape="circle"
          icon={<FacebookFilled />}
          href={import.meta.env.VITE_FACEBOOK_URL}
          target="_blank"
        />
        <Button
          shape="circle"
          icon={<InstagramFilled />}
          href={import.meta.env.VITE_INSTAGRAM_URL}
          target="_blank"
        />
      </Flex>
    </Flex>
  );
};
