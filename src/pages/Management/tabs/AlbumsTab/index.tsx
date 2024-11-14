import { useGetAlbums } from "@/react-query";
import { Empty, Flex } from "antd";
import { AlbumContent } from "./AlbumContent";
import { Outlet, useParams } from "react-router-dom";

export const AlbumsTab = () => {
  const { id: albumId } = useParams();
  const { data: albums } = useGetAlbums();

  if (!albums?.length) return <Empty style={{ marginTop: 50 }} />;

  if (albumId) return <Outlet />;


  return (
    <Flex gap={32} justify="center" className="height-100perc">
      {albums?.map((album) => (
        <AlbumContent {...album} key={album.id} />
      ))}
    </Flex>
  );
};
