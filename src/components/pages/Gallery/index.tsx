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
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <Flex gap={16} vertical className="mb-8 md:mb-12">
          <Flex justify="center">
            <Title level={1} className="mb-0 text-white">
              {getTitle()}
            </Title>
          </Flex>
        </Flex>

        {/* Content Section */}
        <div>
          {isLoading && (
            <Flex justify="center" align="center" className="min-h-[400px]">
              <Spin size="large" />
            </Flex>
          )}

          {!isLoading && !albums?.length && (
            <Flex justify="center" align="center" className="min-h-[400px]">
              <Empty description="Nenhum álbum encontrado" />
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
                        className="text-white hover:text-[#1a5d2e] transition-colors"
                      />
                      <RightOutlined
                        onClick={() => onActive?.(1)}
                        title="Próxima"
                        className="text-white hover:text-[#1a5d2e] transition-colors"
                      />
                      <DownloadOutlined
                        onClick={onDownload(image.url)}
                        title="Fazer download da imagem"
                        className="text-white hover:text-[#1a5d2e] transition-colors"
                      />
                      <ZoomOutOutlined
                        disabled={scale === 1}
                        onClick={onZoomOut}
                        title="Diminuir zoom"
                        className="text-white hover:text-[#1a5d2e] transition-colors"
                      />
                      <ZoomInOutlined
                        disabled={scale === 50}
                        onClick={onZoomIn}
                        title="Aumentar zoom"
                        className="text-white hover:text-[#1a5d2e] transition-colors"
                      />
                      <UndoOutlined
                        onClick={onReset}
                        title="Resetar tudo"
                        className="text-white hover:text-[#1a5d2e] transition-colors"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
