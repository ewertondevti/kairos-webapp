"use client";

import { useGetVerse } from "@/react-query";
import { Button, Flex, Skeleton, Space, Typography } from "antd";
import { useState } from "react";
import { DonationModal } from "../DonationModal";
import styles from "./Donation.module.scss";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const { Text, Title } = Typography;

export const Donation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { ref, isVisible } = useScrollReveal();

  const { data: verse, isLoading } = useGetVerse("2co", "9", "7");

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  return (
    <section
      ref={ref}
      className={`${styles.section} scroll-reveal ${
        isVisible ? "scroll-reveal--visible" : ""
      }`}
    >
      <div className={styles.container}>
        <Flex vertical align="center" className={styles.heading}>
          <Title level={2} className={styles.title}
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
            className={styles.subtitle}
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
          className={styles.content}
        >
          {isLoading && (
            <Skeleton active paragraph={{ rows: 3 }} className={styles.skeletonFull} />
          )}

          {!isLoading && (
            <>
              <Title
                level={4}
                italic
                className={styles.quote}
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
            className={styles.buttonShadow}
          >
            Fazer Doação
          </Button>
        </Flex>

        <DonationModal isOpen={isOpen} onCancel={hideModal} />
      </div>
    </section>
  );
};
