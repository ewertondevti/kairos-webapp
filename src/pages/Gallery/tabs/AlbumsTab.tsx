import { useGetAlbums } from "@/react-query";
import { Flex } from "antd";

export const AlbumsTab = () => {
  const { data } = useGetAlbums();

  return (
    <Flex gap={32}>
      {data?.map((a) => (
        <Flex>{a.name}</Flex>
      ))}
    </Flex>
  );
};
