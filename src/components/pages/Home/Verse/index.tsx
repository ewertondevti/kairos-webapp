"use client";

import { getRandomVerse, getVerse } from "@/services/versesServices";
import { IVerse } from "@/types/app";
import {
  CheckOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";

import { Button, Flex, Skeleton, Space, Typography } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Verse.module.scss";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const { Title, Text } = Typography;

export const Verse = () => {
  const [verse, setVerse] = useState<IVerse>();
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { ref, isVisible } = useScrollReveal();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (copySuccess) {
      setTimeout(() => {
        setCopySuccess(false);
      }, 5000);
    }
  }, [copySuccess]);

  useEffect(() => {
    const abbrev = searchParams?.get("abbrev");
    const chapter = searchParams?.get("chapter");
    const verse = searchParams?.get("verse");

    const updateVerse = (verse: IVerse) => {
      if (verse.text.length < 50) {
        getRandomVerse().then(updateVerse);
      } else {
        setVerse(verse);
        setIsLoading(false);
      }
    };

    setIsLoading(true);

    if (abbrev && chapter && verse)
      getVerse(abbrev, chapter, verse).then(updateVerse);
    else getRandomVerse().then(updateVerse);
  }, [searchParams]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verse!.text);
      setCopySuccess(true);
    } catch (error) {
      console.error(error);
      setCopySuccess(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Este versículo me fez lembrar de você!",
          text: verse?.text,
          url: `https://bible-verses.vercel.app/?abbrev=${verse?.book.abbrev.pt}&chapter=${verse?.chapter}&verse=${verse?.number}`,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      alert("O compartilhamento não é suportado neste navegador.");
    }
  };

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <Flex justify="center" align="center" className={styles.content}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Flex>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={`${styles.section} scroll-reveal ${
        isVisible ? "scroll-reveal--visible" : ""
      }`}
    >
      <div className={styles.container}>
        <Flex vertical align="center" className={styles.heading}>
          <Title level={2} className={styles.sectionTitle}
            style={{
              letterSpacing: "0.1em",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            Para Meditação
          </Title>
        </Flex>

        <Flex
          justify="center"
          align="center"
          vertical
          className={styles.content}
        >
          <div className={styles.bibleBadge} />

          <Flex vertical align="center" className={styles.content}>
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

            <Space size="small" className={styles.reference}>
              <Text strong>{verse?.book.name}</Text>
              <Text strong>
                {verse?.chapter}:{verse?.number}
              </Text>
            </Space>

            <Flex gap={20} justify="center" wrap="wrap" className={styles.actions}>
              <Button
                size="large"
                icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopy}
                className={styles.copyButton}
              >
                {copySuccess ? "Copiado" : "Copiar"}
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              >
                Compartilhar
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </div>
    </section>
  );
};
