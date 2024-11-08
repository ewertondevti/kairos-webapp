import { AlbumModal } from "@/components/AlbumModal";
import { TopBar } from "@/components/TopBar";
import { useGetImages } from "@/react-query";
import api from "@/services/httpClient";
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
import { Col, Image, Row, Space, Tabs } from "antd";
import Title from "antd/es/typography/Title";
import { saveAs } from "file-saver";
import { useState } from "react";
import "./Gallery.scss";
import { galleryTabs } from "./tabs/gallery.tabs";

const Gallery = () => {
  const [current, setCurrent] = useState(0);

  const { data } = useGetImages();

  const onDownload = () => {
    if (data) {
      const img = data[current];

      api
        .get<Blob>(img.url, { responseType: "blob" })
        .then(({ data }) => saveAs(data, img.name));
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Title style={{ margin: 0 }}>Galeria</Title>

      <Col span={24}>
        <TopBar />
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
          <Tabs size="large" items={galleryTabs} destroyInactiveTabPane />
        </Image.PreviewGroup>
      </Col>

      <AlbumModal />
    </Row>
  );
};

export default Gallery;
