import { useGetAlbums } from "@/react-query";
import { Empty, Flex, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { AlbumContent } from "../Management/tabs/AlbumsTab/AlbumContent";

export const Gallery = () => {
  const { data: albums } = useGetAlbums();

  if (!albums?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Layout style={{ padding: 20 }}>
      <Content>
        <Flex vertical>
          <Title>Galeria</Title>

          <Flex gap={32} justify="center">
            {albums?.map((album) => (
              <AlbumContent {...album} key={album.id} />
            ))}
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
};
