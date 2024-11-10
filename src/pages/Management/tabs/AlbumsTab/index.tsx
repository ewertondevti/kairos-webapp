import { useGetAlbums } from "@/react-query";
import { Flex } from "antd";
import { AlbumContent } from "./AlbumContent";

export const AlbumsTab = () => {
  const { data: albums } = useGetAlbums();

  return (
    <Flex gap={32} justify="center">
      {albums?.map((album) => (
        <AlbumContent {...album} key={album.id} />
      ))}
    </Flex>
  );
};
