'use client';

import { onDownload } from "@/helpers/app";
import { useGetAlbums } from "@/react-query";
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import {
  Empty,
  Flex,
  Image,
  Layout,
  Space,
  Spin,
} from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { AlbumContent } from "../Management/tabs/AlbumsTab/AlbumContent";
import { AlbumDetails } from "../Management/tabs/AlbumsTab/AlbumDetails";

type GalleryProps = {
  albumId?: string;
};

export const Gallery = ({ albumId }: GalleryProps) => {
  const { data: albums, isLoading } = useGetAlbums();

  const getTitle = () => {
    const title = "Galeria";

    if (albumId && albums) {
      const album = albums.find((a) => a.id === albumId);

      if (album) return album?.name;
      return title;
    }

    return title;
  };

  return (
    <Layout style={{ padding: 20 }} className="h-full">
      <Flex gap={16} vertical>
        <Flex justify="center">
          <Title>{getTitle()}</Title>
        </Flex>
      </Flex>

      <Content>
        {!albums?.length && (
          <Flex justify="center">
            <Spin spinning={isLoading}>
              <Empty />
            </Spin>
          </Flex>
        )}

        {!!albumId && (
          <Image.PreviewGroup
            preview={{
              toolbarRender: (
                _,
                {
                  image,
                  transform: { scale },
                  actions: { onActive, onZoomOut, onZoomIn, onReset },
                }
              ) => {
                return (
                  <Space size={12} className="toolbar-wrapper">
                    <LeftOutlined
                      onClick={() => onActive?.(-1)}
                      title="Voltar"
                    />
                    <RightOutlined
                      onClick={() => onActive?.(1)}
                      title="Próxima"
                    />
                    <DownloadOutlined
                      onClick={onDownload(image.url)}
                      title="Fazer download da imagem"
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
                );
              },
            }}
          >
            <AlbumDetails albumId={albumId} />
          </Image.PreviewGroup>
        )}

        {!albumId && (
          <Flex
            gap={32}
            justify="center"
            wrap
            className="h-full"
            style={{ overflowY: "auto" }}
          >
            {albums?.map((album) => (
              <AlbumContent {...album} key={album.id} basePath="/gallery" />
            ))}
          </Flex>
        )}
      </Content>
    </Layout>
  );
};

export default Gallery;
