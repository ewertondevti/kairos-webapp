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
      setVerse(verse);
      setIsLoading(false);
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
    } catch (err) {
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

  if (isLoading) return <Skeleton active />;

  return (
    <Col span={24}>

      <Flex justify="center" align="center" className="verse" vertical>
        <Space className="verse__content" direction="vertical">
          <Title level={5}>{verse?.text}</Title>
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
        </Space>
      </Flex>

      <Divider />
    </Col>
  );
};