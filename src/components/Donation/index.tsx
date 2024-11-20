import { useGetVerse } from "@/react-query";
import { Button, Col, Divider, Flex, Skeleton, Space, Typography } from "antd";
import { useState } from "react";
import { DonationModal } from "../DonationModal";

const { Text, Title } = Typography;

export const Donation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: verse, isLoading } = useGetVerse("2co", "9", "7");

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  return (
    <Col span={24}>
      <Divider>
        <Title level={3} className="text-uppercase">
          Ajude
        </Title>
      </Divider>

      <Flex align="center" justify="center" className="home__content-container">
        <Flex
          vertical
          gap={32}
          align="center"
          justify="center"
          style={{ maxWidth: 600, textAlign: "center" }}
        >
          {isLoading && <Skeleton active />}

          {!isLoading && (
            <>
              <Title level={5} italic>
                "{verse?.text}"
              </Title>

              <Space size="small">
                <Text strong>{verse?.book.name}</Text>
                <Text strong>
                  {verse?.chapter}:{verse?.number}
                </Text>
              </Space>
            </>
          )}

          <Button type="primary" size="large" onClick={showModal}>
            Faça uma doação
          </Button>
        </Flex>

        <DonationModal isOpen={isOpen} onCancel={hideModal} />
      </Flex>
    </Col>
  );
};
