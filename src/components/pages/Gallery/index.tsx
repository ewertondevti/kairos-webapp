"use client";

import { onDownload } from "@/helpers/app";
import { useGetAlbumById, useGetAlbums } from "@/react-query";
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Empty, Flex, Image, Space, Typography } from "antd";
import { AlbumContent } from "../Management/tabs/AlbumsTab/AlbumContent";
import { AlbumDetails } from "../Management/tabs/AlbumsTab/AlbumDetails";
import styles from "./Gallery.module.scss";

const { Title, Text } = Typography;

type GalleryProps = {
  albumId?: string;
};

export const Gallery = ({ albumId }: GalleryProps) => {
  const isAlbumView = !!albumId;
  const { data: albums, isLoading: isAlbumsLoading } = useGetAlbums({
    enabled: !isAlbumView,
  });
  const { data: album } = useGetAlbumById(albumId, {
    enabled: isAlbumView,
    limit: 24,
  });

  const getTitle = () => {
    const title = "Galeria de álbuns";

    if (isAlbumView && album) {
      return album?.name;
    }

    if (!isAlbumView && albums) {
      if (albumId) {
        const albumFromList = albums.find((a) => a.id === albumId);
        if (albumFromList) return albumFromList?.name;
      }
      return title;
    }

    return title;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Flex gap={12} vertical className={styles.header}>
          <Flex justify="center">
            <Title level={1} className={styles.title}>
              {getTitle()}
            </Title>
          </Flex>
          {!albumId && (
            <div className={styles.subtitleWrapper}>
              <span className={styles.divider} />
              <Text className={styles.subtitle}>
                Explore nossos álbuns de fotos e momentos especiais
              </Text>
            </div>
          )}
        </Flex>

        <div className={styles.content}>
          {isAlbumsLoading && (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonFooter}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isAlbumsLoading && !albums?.length && !isAlbumView && (
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
              <AlbumDetails albumId={albumId} initialAlbum={album} />
            </Image.PreviewGroup>
          )}

          {!albumId && albums && albums.length > 0 && (
            <div className={styles.grid}>
              {albums.map((album, index) => (
                <AlbumContent
                  {...album}
                  key={album.id}
                  basePath="/gallery"
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
