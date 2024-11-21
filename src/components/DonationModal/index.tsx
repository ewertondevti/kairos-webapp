import MbWayLogo from "@/assets/mb-way.svg";
import { Descriptions, Flex, Modal, Typography } from "antd";
import { FC } from "react";

const { Text } = Typography;

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const DonationModal: FC<Props> = ({ isOpen, onCancel }) => {
  return (
    <Modal
      open={isOpen}
      onOk={onCancel}
      onCancel={onCancel}
      title="Faça uma doação"
    >
      <Flex gap={8} vertical>
        <Flex justify="center">
          <img src={MbWayLogo} />
        </Flex>

        <Descriptions column={1} bordered>
          <Descriptions.Item label="Nome">Kairós Portugal</Descriptions.Item>
          <Descriptions.Item label="Telemóvel">
            <Flex gap={4}>
              <Text>+351</Text>
              <Text copyable>966 524 967</Text>
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </Flex>
    </Modal>
  );
};
