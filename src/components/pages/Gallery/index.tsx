"use client";

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
import { Empty, Flex, Image, Space, Spin, Typography } from "antd";
import { AlbumContent } from "../Management/tabs/AlbumsTab/AlbumContent";
import { AlbumDetails } from "../Management/tabs/AlbumsTab/AlbumDetails";
import styles from "./Gallery.module.scss";

const { Title } = Typography;

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
    <div className={styles.page}>
      <div className={styles.container}>
        <Flex gap={16} vertical className={styles.header}>
          <Flex justify="center">
            <Title level={1} className={styles.title}>
              {getTitle()}
            </Title>
          </Flex>
        </Flex>

        <div className={styles.content}>
          {isLoading && (
            <Flex justify="center" align="center" className={styles.centered}>
              <Spin size="large" />
            </Flex>
          )}

          {!isLoading && !albums?.length && (
            <Flex justify="center" align="center" className={styles.centered}>
              <Empty description="Nenhum álbum encontrado" />
            </Flex>
          )}

          {!!albumId && (
            <Image.PreviewGroup
              preview={{
                actionsRender: (
                  _,
                  {
                    image,
                    transform: { scale },
                    actions: { onActive, onZoomOut, onZoomIn, onReset },
                  }
                ) => {
                  return (
                    <Space size={12} className={styles.toolbar}>
                      <LeftOutlined
                        onClick={() => onActive?.(-1)}
                        title="Voltar"
                        className={styles.toolbarIcon}
                      />
                      <RightOutlined
                        onClick={() => onActive?.(1)}
                        title="Próxima"
                        className={styles.toolbarIcon}
                      />
                      <DownloadOutlined
                        onClick={onDownload(image.url)}
                        title="Fazer download da imagem"
                        className={styles.toolbarIcon}
                      />
                      <ZoomOutOutlined
                        disabled={scale === 1}
                        onClick={onZoomOut}
                        title="Diminuir zoom"
                        className={styles.toolbarIcon}
                      />
                      <ZoomInOutlined
                        disabled={scale === 50}
                        onClick={onZoomIn}
                        title="Aumentar zoom"
                        className={styles.toolbarIcon}
                      />
                      <UndoOutlined
                        onClick={onReset}
                        title="Resetar tudo"
                        className={styles.toolbarIcon}
                      />
                    </Space>
                  );
                },
              }}
            >
              <AlbumDetails albumId={albumId} />
            </Image.PreviewGroup>
          )}

          {!albumId && albums && albums.length > 0 && (
            <div className={styles.grid}>
              {albums.map((album) => (
                <AlbumContent {...album} key={album.id} basePath="/gallery" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
