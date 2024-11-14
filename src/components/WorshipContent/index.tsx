import { Flex, Typography } from "antd";
import { FC } from "react";

const { Title, Text } = Typography;

type Props = {
  title: string;
  label1: string;
  label2: string;
};

export const WorshipContent: FC<Props> = ({ title, label1, label2 }) => {
  return (
    <Flex gap={16} vertical align="center">
      <Title level={5} className="text-uppercase">
        {title}
      </Title>

      <Flex vertical align="center">
        <Text>{label1}</Text>
        <Text>{label2}</Text>
      </Flex>
    </Flex>
  );
};
