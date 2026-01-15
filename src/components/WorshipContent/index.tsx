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
    <Flex gap={20} vertical align="center">
      <Title
        level={5}
        className="text-emerald-900/90 uppercase tracking-[0.25em] text-lg"
      >
        {title}
      </Title>

      <Flex vertical align="center" gap={8}>
        <Text className="text-emerald-950/90 text-base">{label1}</Text>
        <Text className="text-emerald-900/80 text-[15px]">
          {label2}
        </Text>
      </Flex>
    </Flex>
  );
};
