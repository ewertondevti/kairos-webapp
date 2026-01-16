"use client";

import { getRandomVerse, getVerse } from "@/services/versesServices";
import { IVerse } from "@/types/app";
import {
  CheckOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button, Flex, Skeleton, Space, Typography } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type Ref } from "react";
import styles from "./Verse.module.scss";

const { Title, Text } = Typography;

type VerseContentProps = {
  abbrev: string | null;
  chapter: string | null;
  verseNumber: string | null;
  isVisible: boolean;
  scrollRef: Ref<HTMLElement>;
};

const VerseContent = ({
  abbrev,
  chapter,
  verseNumber,
  isVisible,
  scrollRef,
}: VerseContentProps) => {
  const [verse, setVerse] = useState<IVerse>();
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!copySuccess) return;
    const timeout = setTimeout(() => {
      setCopySuccess(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [copySuccess]);

  useEffect(() => {
    let isMounted = true;

    const updateVerse = (nextVerse: IVerse) => {
      if (!isMounted) return;

      if (nextVerse.text.length < 50) {
        getRandomVerse().then(updateVerse);
        return;
      }

      setVerse(nextVerse);
    };

    const request =
      abbrev && chapter && verseNumber
        ? getVerse(abbrev, chapter, verseNumber)
        : getRandomVerse();

    request.then(updateVerse).catch((error) => {
      console.error("Erro ao carregar versículo:", error);
    });

    return () => {
      isMounted = false;
    };
  }, [abbrev, chapter, verseNumber]);

  const handleCopy = async () => {
    if (!verse) return;

    try {
      await navigator.clipboard.writeText(verse.text);
      setCopySuccess(true);
    } catch (error) {
      console.error(error);
      setCopySuccess(false);
    }
  };

  const handleShare = async () => {
    if (!verse) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Este versículo me fez lembrar de você!",
          text: verse.text,
          url: `https://bible-verses.vercel.app/?abbrev=${verse.book.abbrev.pt}&chapter=${verse.chapter}&verse=${verse.number}`,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      alert("O compartilhamento não é suportado neste navegador.");
    }
  };

  if (!verse) {
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
      ref={scrollRef}
      className={`${styles.section} scroll-reveal ${
        isVisible ? "scroll-reveal--visible" : ""
      }`}
    >
      <div className={styles.container}>
        <Flex vertical align="center" className={styles.heading}>
          <Title
            level={2}
            className={styles.sectionTitle}
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
              &quot;{verse.text}&quot;
            </Title>

            <Space size="small" className={styles.reference}>
              <Text strong>{verse.book.name}</Text>
              <Text strong>
                {verse.chapter}:{verse.number}
              </Text>
            </Space>

            <Flex
              gap={20}
              justify="center"
              wrap="wrap"
              className={styles.actions}
            >
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

export const Verse = () => {
  const { ref, isVisible } = useScrollReveal();
  const searchParams = useSearchParams();

  const abbrev = searchParams?.get("abbrev") ?? null;
  const chapter = searchParams?.get("chapter") ?? null;
  const verseNumber = searchParams?.get("verse") ?? null;
  const verseKey = `${abbrev ?? "random"}-${chapter ?? "random"}-${
    verseNumber ?? "random"
  }`;

  return (
    <VerseContent
      key={verseKey}
      abbrev={abbrev}
      chapter={chapter}
      verseNumber={verseNumber}
      isVisible={isVisible}
      scrollRef={ref}
    />
  );
};
