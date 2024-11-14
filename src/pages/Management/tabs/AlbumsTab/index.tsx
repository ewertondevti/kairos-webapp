import { useGetAlbums } from "@/react-query";
import { Empty, Flex } from "antd";
import { Outlet, useParams } from "react-router-dom";
import { AlbumContent } from "./AlbumContent";

export const AlbumsTab = () => {
  const { id: albumId } = useParams();
  const { data: albums } = useGetAlbums();

  if (!albums?.length) return <Empty style={{ marginTop: 50 }} />;

  if (albumId) return <Outlet />;

  return (
    <Flex
      gap={32}
      justify="center"
      wrap
      className="height-100perc"
      style={{ overflowY: "auto" }}
    >
      {albums?.map((album) => (
        <AlbumContent {...album} key={album.id} />
      ))}
    </Flex>
  );
};
