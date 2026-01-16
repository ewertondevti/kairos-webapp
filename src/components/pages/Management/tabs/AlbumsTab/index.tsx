"use client";

import { useGetAlbumsInfinite } from "@/react-query";
import { Button, Empty, Flex, Spin } from "antd";
import { AlbumContent } from "./AlbumContent";
import { AlbumDetails } from "./AlbumDetails";

type AlbumsTabProps = {
  albumId?: string;
};

export const AlbumsTab = ({ albumId }: AlbumsTabProps) => {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAlbumsInfinite({ limit: 18 });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 200 }}>
        <Spin spinning />
      </Flex>
    );
  }

  const albums = data?.pages?.flatMap((page) => page?.albums ?? []) ?? [];

  if (!albums.length) return <Empty style={{ marginTop: 50 }} />;

  if (albumId) return <AlbumDetails albumId={albumId} />;

  return (
    <Flex vertical gap={16} className="h-full">
      <Flex gap={32} justify="center" wrap style={{ minHeight: 200 }}>
        {albums.map((album) => (
          <AlbumContent
            {...album}
            key={album.id}
            basePath="/management/albums"
          />
        ))}
      </Flex>

      {hasNextPage && (
        <Flex justify="center">
          <Button
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
          >
            Carregar mais
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
