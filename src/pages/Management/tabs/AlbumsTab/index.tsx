import { useGetAlbums } from "@/react-query";
import { Empty, Flex } from "antd";
import { AlbumContent } from "./AlbumContent";

export const AlbumsTab = () => {
  const { data: albums } = useGetAlbums();

  if (!albums?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Flex gap={32} justify="center">
      {albums?.map((album) => (
        <AlbumContent {...album} key={album.id} />
      ))}
    </Flex>
  );
};
