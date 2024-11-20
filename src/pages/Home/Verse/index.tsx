import { getRandomVerse, getVerse } from "@/services/versesServices";
import { IVerse } from "@/types/app";
import {
  CheckOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { Button, Col, Divider, Flex, Skeleton, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Verse.scss";

const { Title, Text } = Typography;

export const Verse = () => {
  const [verse, setVerse] = useState<IVerse>();
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [search] = useSearchParams();

  useEffect(() => {
    const abbrev = search.get("abbrev");
    const chapter = search.get("chapter");
    const verse = search.get("verse");

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
  }, [search]);

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
        className="home__content-container"
      >
        <div className="verse__bible-icon" />

        <Flex
          vertical
          align="center"
          justify="center"
          style={{ maxWidth: 600, textAlign: "center" }}
        >
          <Title level={5} italic>
            "{verse?.text}"
          </Title>

          <Space size="small">
            <Text strong>{verse?.book.name}</Text>
            <Text strong>
              {verse?.chapter}:{verse?.number}
            </Text>
          </Space>

          <Flex
            gap={8}
            justify="center"
            align="center"
            className="verse__content-buttons"
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
