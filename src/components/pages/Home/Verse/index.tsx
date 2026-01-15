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

const { Title, Text } = Typography;

export const Verse = () => {
  const [verse, setVerse] = useState<IVerse>();
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Flex justify="center" align="center" className="min-h-[400px]">
            <Skeleton active paragraph={{ rows: 3 }} />
          </Flex>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="mx-auto px-4 flex flex-col items-center justify-center">
        <Flex vertical align="center" className="mb-14">
          <Title
            level={2}
            className="mb-0"
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
          className="max-w-[900px] mx-auto"
        >
          <div className="w-[140px] h-[140px] rounded-full border-4 border-primary bg-[url('/bible.jpg')] bg-cover bg-center bg-no-repeat shadow-[0_8px_24px_rgba(26,93,46,0.25)] mb-10 mx-auto" />

          <Flex vertical align="center" className="text-center w-full">
            <Title
              level={4}
              italic
              className="mb-8"
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                fontFamily: "var(--font-playfair), Georgia, serif",
                maxWidth: "100%",
              }}
            >
              "{verse?.text}"
            </Title>

            <Space size="small" className="mb-10">
              <Text strong>{verse?.book.name}</Text>
              <Text strong>
                {verse?.chapter}:{verse?.number}
              </Text>
            </Space>

            <Flex gap={20} justify="center" wrap="wrap" className="w-full">
              <Button
                size="large"
                icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopy}
                style={{
                  borderColor: "#1a5d2e",
                  borderWidth: 2,
                  color: "#1a5d2e",
                }}
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
