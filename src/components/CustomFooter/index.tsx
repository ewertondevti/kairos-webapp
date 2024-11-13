import { FacebookFilled, InstagramFilled } from "@ant-design/icons";
import { Button, Col, Divider, Flex, Typography } from "antd";

const { Title, Text } = Typography;

export const CustomFooter = () => {
  return (
    <Col span={24}>
      <Divider>
        <Title level={3} style={{ margin: 0, textTransform: "uppercase" }}>
          Onde estamos
        </Title>
      </Divider>

      <Flex vertical align="center" gap={16} className="home__content-container">
        <Flex justify="center" align="center" vertical>
          <img src="/kairos-logo.png" width={50} />
          <Title level={5}>Igreja Kairós Portugal</Title>
          <Text>Rua da Papoila 14, 2135-085 Samora Correia</Text>
        </Flex>

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
    </Col>
  );
};
