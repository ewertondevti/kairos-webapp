import { useGetAlbums } from "@/react-query";
import { useAppState } from "@/store";
import { Flex, Image, Typography } from "antd";

const { Text } = Typography;

export const AlbumsTab = () => {
  const { toogleAlbumModal } = useAppState();

  const { data: albums } = useGetAlbums();

  return (
    <Flex gap={32} justify="center">
      {albums?.map(({ id, coverImages, name }) => (
        <Flex className="gallery__album-content" key={id}>
          {coverImages.map(({ id, url }, idx) => (
            <Image
              src={url}
              key={id}
              className={`gallery__album-content--cover${idx + 1}`}
              preview={false}
            />
          ))}

          <Text>{name}</Text>
        </Flex>
      ))}
    </Flex>
  );
};
