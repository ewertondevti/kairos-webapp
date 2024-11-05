import { useGetImages } from "@/react-query";
import { addBase64Prefix } from "@/utils/app";
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
import { Button, Col, Flex, Image, Row, Space } from "antd";
import { saveAs } from "file-saver";
import { useState } from "react";
import { AddImagesModal } from "./AddImagesModal";
import "./Gallery.scss";

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const { data } = useGetImages();

  const onDownload = () => {
    if (data) {
      const img = data[current];

      const blob = new Blob(
        [Uint8Array.from(atob(img.image), (c) => c.charCodeAt(0))],
        { type: "image/png" }
      );

      saveAs(blob, img.filename);
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Flex justify="end">
          <Button type="primary" onClick={showModal}>
            Adicionar imagen(s)
          </Button>
        </Flex>
      </Col>

      <Col span={24}>
        <Flex gap={16}>
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
                  <LeftOutlined onClick={() => onActive?.(-1)} />
                  <RightOutlined onClick={() => onActive?.(1)} />
                  <DownloadOutlined onClick={onDownload} />
                  <SwapOutlined rotate={90} onClick={onFlipY} />
                  <SwapOutlined onClick={onFlipX} />
                  <RotateLeftOutlined onClick={onRotateLeft} />
                  <RotateRightOutlined onClick={onRotateRight} />
                  <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                  <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                  <UndoOutlined onClick={onReset} />
                </Space>
              ),
              onChange: (index) => {
                setCurrent(index);
              },
            }}
          >
            {data?.map(({ image, id }) => (
              <Image
                key={id}
                src={addBase64Prefix(image)}
                className="gallery__image"
                alt={`image-${id}`}
              />
            ))}
          </Image.PreviewGroup>
        </Flex>
      </Col>

      <AddImagesModal isOpen={isOpen} onCancel={hideModal} />
    </Row>
  );
};

export default Gallery;
