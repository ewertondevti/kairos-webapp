import { AlbumModal } from "@/components/AlbumModal";
import { CustomImage } from "@/components/CustomImage";
import { useGetImages } from "@/react-query";
import api from "@/services/httpClient";
import { useAuth } from "@/store";
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Flex, Image, Row, Space, Tabs, TabsProps } from "antd";
import Title from "antd/es/typography/Title";
import { saveAs } from "file-saver";
import { useMemo, useState } from "react";
import { AddImagesModal } from "./AddImagesModal";
import "./Gallery.scss";
import { AlbumsTab } from "./tabs/AlbumsTab";

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const { user } = useAuth();
  const isAuthenticated = useMemo(() => !!user, [user]);

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const { data, isLoading } = useGetImages();

  const onDownload = () => {
    if (data) {
      const img = data[current];

      api
        .get<Blob>(img.url, { responseType: "blob" })
        .then(({ data }) => saveAs(data, img.name));
    }
  };

  const extraBtns: TabsProps["tabBarExtraContent"] = {
    right: (
      <Flex gap={8}>
        <Button type="primary">Selecionar imagem(s)</Button>
      </Flex>
    ),
  };

  const items: TabsProps["items"] = [
    {
      key: "all",
      label: "Todas as fotos",
      children: (
        <Flex gap={8} justify="center" className="gallery__image-container">
          {data?.map((image) => (
            <CustomImage {...image} key={image.id} isLoading={isLoading} />
          ))}
        </Flex>
      ),
    },
    {
      key: "albuns",
      label: "Álbuns",
      children: <AlbumsTab />,
    },
    {
      key: "presentation",
      label: "Apresentação",
      children: <></>,
    },
    {
      key: "events",
      label: "Próximos eventos",
      children: <></>,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Flex justify="space-between" align="center">
          <Title style={{ margin: 0 }}>Galeria</Title>

          <Flex>
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faUpload} />}
                onClick={showModal}
              >
                Upload
              </Button>
            )}
          </Flex>
        </Flex>
      </Col>

      <Col span={24}>
        <Image.PreviewGroup
          preview={{
            toolbarRender: (
              _,
              {
                transform: { scale },
                actions: {
                  onActive,
                  onFlipY,
                  onFlipX,
                  onRotateLeft,
                  onRotateRight,
                  onZoomOut,
                  onZoomIn,
                  onReset,
                },
              }
            ) => (
              <Space size={12} className="toolbar-wrapper">
                <LeftOutlined onClick={() => onActive?.(-1)} title="Voltar" />
                <RightOutlined onClick={() => onActive?.(1)} title="Próxima" />
                <DownloadOutlined
                  onClick={onDownload}
                  title="Fazer download da imagem"
                />
                <SwapOutlined
                  rotate={90}
                  onClick={onFlipY}
                  title="Inverter imagem de cima para baixo"
                />
                <SwapOutlined
                  onClick={onFlipX}
                  title="Inverter imagem da esquerda para a direita"
                />
                <RotateLeftOutlined
                  onClick={onRotateLeft}
                  title="Girar imagem para a esquerda"
                />
                <RotateRightOutlined
                  onClick={onRotateRight}
                  title="Girar imagem para a direita"
                />
                <ZoomOutOutlined
                  disabled={scale === 1}
                  onClick={onZoomOut}
                  title="Diminuir zoom"
                />
                <ZoomInOutlined
                  disabled={scale === 50}
                  onClick={onZoomIn}
                  title="Aumentar zoom"
                />
                <UndoOutlined onClick={onReset} title="Resetar tudo" />
              </Space>
            ),
            onChange: (index) => setCurrent(index),
            onVisibleChange(_value, _prevValue, current) {
              setCurrent(current);
            },
          }}
        >
          <Tabs size="large" items={items} tabBarExtraContent={extraBtns} />
        </Image.PreviewGroup>
      </Col>

      <AddImagesModal isOpen={isOpen} onCancel={hideModal} />
      <AlbumModal />
    </Row>
  );
};

export default Gallery;
