"use client";

import { useGetAlbums } from "@/react-query";
import { Empty, Flex, Spin } from "antd";
import { AlbumContent } from "./AlbumContent";
import { AlbumDetails } from "./AlbumDetails";

type AlbumsTabProps = {
  albumId?: string;
};

export const AlbumsTab = ({ albumId }: AlbumsTabProps) => {
  const { data: albums, isLoading } = useGetAlbums();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 200 }}>
        <Spin spinning />
      </Flex>
    );
  }

  if (!albums?.length) return <Empty style={{ marginTop: 50 }} />;

  if (albumId) return <AlbumDetails albumId={albumId} />;

  return (
    <Flex
      gap={32}
      justify="center"
      wrap
      className="h-full"
      style={{ overflowY: "auto", minHeight: 200 }}
    >
      {albums?.map((album) => (
        <AlbumContent {...album} key={album.id} basePath="/management/albums" />
      ))}
    </Flex>
  );
};
