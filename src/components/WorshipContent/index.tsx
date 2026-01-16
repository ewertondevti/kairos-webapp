import { Flex, Typography } from "antd";
import { FC } from "react";
import styles from "./WorshipContent.module.scss";

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
        className={styles.title}
      >
        {title}
      </Title>

      <Flex vertical align="center" gap={8}>
        <Text className={styles.labelPrimary}>{label1}</Text>
        <Text className={styles.labelSecondary}>{label2}</Text>
      </Flex>
    </Flex>
  );
};
