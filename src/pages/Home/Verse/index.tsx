"use client";

import { getRandomVerse, getVerse } from "@/services/versesServices";
import { IVerse } from "@/types/app";
import {
  CheckOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";

import { Button, Col, Divider, Flex, Skeleton, Space, Typography } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

type VerseContentProps = {
  abbrev: string | null;
  chapter: string | null;
  verseNumber: string | null;
};

const VerseContent = ({ abbrev, chapter, verseNumber }: VerseContentProps) => {
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

    const request = abbrev && chapter && verseNumber
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
      <Col span={24}>
        <Divider />

        <Flex justify="center">
          <Skeleton active className="skeleton-verse" />
        </Flex>

        <Divider />
      </Col>
    );
  }

  return (
    <Col span={24}>
      <Divider>
        <Title level={3} style={{ margin: 0, textTransform: "uppercase" }}>
          Para Meditação
        </Title>
      </Divider>

      <Flex
        justify="center"
        align="center"
        vertical
        className="my-[100px] md:my-[75px] sm:my-[50px]"
      >
        <div className="mb-5 w-[100px] h-[100px] md:w-[90px] md:h-[90px] sm:w-[75px] sm:h-[75px] rounded-full border border-green-500 bg-cover bg-no-repeat bg-center bg-[url('/bible.jpg')]" />

        <Flex
          vertical
          align="center"
          justify="center"
          style={{ maxWidth: 600, textAlign: "center" }}
        >
          <Title level={5} italic>
            &quot;{verse.text}&quot;
          </Title>

          <Space size="small">
            <Text strong>{verse.book.name}</Text>
            <Text strong>
              {verse.chapter}:{verse.number}
            </Text>
          </Space>

          <Flex
            gap={8}
            justify="center"
            align="center"
            className="mt-5 [&_button]:w-[200px]"
          >
            <Button
              icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleCopy}
            >
              {copySuccess ? "Copiado" : "Copiar"}
            </Button>

            <Button icon={<ShareAltOutlined />} onClick={handleShare}>
              Compartilhar
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Col>
  );
};

export const Verse = () => {
  const searchParams = useSearchParams();
  const abbrev = searchParams?.get("abbrev") ?? null;
  const chapter = searchParams?.get("chapter") ?? null;
  const verseNumber = searchParams?.get("verse") ?? null;
  const verseKey = `${abbrev ?? "random"}-${chapter ?? "random"}-${verseNumber ?? "random"}`;

  return (
    <VerseContent
      key={verseKey}
      abbrev={abbrev}
      chapter={chapter}
      verseNumber={verseNumber}
    />
  );
};

export default Verse;
