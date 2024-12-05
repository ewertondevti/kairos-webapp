import { useGetAlbums } from "@/react-query";
import { Empty, Flex, Spin } from "antd";
import { Outlet, useParams } from "react-router-dom";
import { AlbumContent } from "./AlbumContent";

export const AlbumsTab = () => {
  const { id: albumId } = useParams();
  const { data: albums, isLoading } = useGetAlbums();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 200 }}>
        <Spin spinning />
      </Flex>
    );
  }

  if (!albums?.length) return <Empty style={{ marginTop: 50 }} />;

  if (albumId) return <Outlet />;

  return (
    <Flex
      gap={32}
      justify="center"
      wrap
      className="height-100perc"
      style={{ overflowY: "auto", minHeight: 200 }}
    >
      {albums?.map((album) => (
        <AlbumContent {...album} key={album.id} />
      ))}
    </Flex>
  );
};
