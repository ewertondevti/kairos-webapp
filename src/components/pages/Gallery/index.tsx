"use client";

import { useGetAlbumById, useGetAlbumsInfinite } from "@/react-query";
import {
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Button, Empty, Flex, Image, Space, Typography } from "antd";
import { AlbumContent } from "../Management/tabs/AlbumsTab/AlbumContent";
import { AlbumDetails } from "../Management/tabs/AlbumsTab/AlbumDetails";
import styles from "./Gallery.module.scss";

const { Title, Text } = Typography;

type GalleryProps = {
  albumId?: string;
};

export const Gallery = ({ albumId }: GalleryProps) => {
  const isAlbumView = !!albumId;
  const {
    data,
    isLoading: isAlbumsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAlbumsInfinite({
    enabled: !isAlbumView,
    limit: 18,
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

    const albums = data?.pages?.flatMap((page) => page?.albums ?? []) ?? [];
    if (!isAlbumView && albums.length) {
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

          {!isAlbumsLoading &&
            !data?.pages?.some((page) => page?.albums?.length) &&
            !isAlbumView && (
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

          {!albumId &&
            data?.pages?.some((page) => page?.albums?.length) && (
            <div className={styles.grid}>
              {data?.pages
                ?.flatMap((page) => page?.albums ?? [])
                .map((album, index) => (
                  <AlbumContent
                    {...album}
                    key={album.id}
                    basePath="/gallery"
                    index={index}
                  />
                ))}
            </div>
          )}

          {!albumId && hasNextPage && (
            <Flex justify="center" className={styles.loadMore}>
              <Button
                type="primary"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
                className={styles.loadMoreButton}
              >
                Carregar mais
              </Button>
            </Flex>
          )}
        </div>
      </div>
    </div>
  );
};
