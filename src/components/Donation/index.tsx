"use client";

import { useGetVerse } from "@/react-query";
import { Button, Flex, Skeleton, Space, Typography } from "antd";
import { useState } from "react";
import { DonationModal } from "../DonationModal";

const { Text, Title } = Typography;

export const Donation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: verse, isLoading } = useGetVerse("2co", "9", "7");

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  return (
    <section className="py-24 bg-white-soft">
      <div className="mx-auto px-4 flex flex-col items-center justify-center">
        <Flex vertical align="center" className="mb-14">
          <Title
            level={2}
            className="mb-5 text-center"
            style={{
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 600,
            }}
          >
            Apoie Nossa Missão
          </Title>
          <Typography.Text
            type="secondary"
            className="text-center"
            style={{ fontSize: 16 }}
          >
            Sua doação nos ajuda a continuar espalhando a Palavra de Deus
          </Typography.Text>
        </Flex>

        <Flex
          vertical
          gap={40}
          align="center"
          justify="center"
          className="max-w-[900px] mx-auto text-center w-full"
        >
          {isLoading && (
            <Skeleton active paragraph={{ rows: 3 }} className="w-full" />
          )}

          {!isLoading && (
            <>
              <Title
                level={4}
                italic
                className="w-full"
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  maxWidth: "100%",
                }}
              >
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

          <Button
            type="primary"
            size="large"
            onClick={showModal}
            style={{
              boxShadow: "0 4px 12px rgba(26, 93, 46, 0.3)",
            }}
          >
            Fazer Doação
          </Button>
        </Flex>

        <DonationModal isOpen={isOpen} onCancel={hideModal} />
      </div>
    </section>
  );
};
