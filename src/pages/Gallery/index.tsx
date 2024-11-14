import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { useGetAlbums } from "@/react-query";
import { Breadcrumb, BreadcrumbProps, Empty, Flex, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { AlbumContent } from "../Management/tabs/AlbumsTab/AlbumContent";

export const Gallery = () => {
  const { pathname } = useLocation();
  const { id: albumId } = useParams();
  const { data: albums } = useGetAlbums();

  const keys = pathname.split("/").filter(Boolean);

  const getLabel = (key: string) => {
    const album = albums?.find((a) => a.id === key);

    switch (key) {
      case RoutesEnums.Gallery:
        return "Galeria";
      case RoutesEnums.Management:
        return "Gerenciamento";
      case ManagementRoutesEnums.Albums:
        return "Álbuns";
      case ManagementRoutesEnums.Presentation:
        return "Apresentação";
      case ManagementRoutesEnums.Events:
        return "Eventos";

      default:
        if (album) return album.name;
        return "";
    }
  };

  const getLink = (index: number) => {
    const link = keys.reduce((acc, curr, currIndex) => {
      if (currIndex <= index) return (acc += `/${curr}`);
      return acc;
    }, "");

    return link;
  };

  const items: BreadcrumbProps["items"] = keys.map((key, idx) => ({
    key,
    title: getLabel(key),
    href: getLink(idx),
  }));

  const getTitle = () => {
    let title = "Galeria";

    if (albumId && albums) {
      const album = albums.find((a) => a.id === albumId);

      if (album) return album?.name;
      return title;
    }

    return title;
  };

  if (!albums?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Layout style={{ padding: 20 }} className="height-100perc">
      <Flex gap={16} vertical>
        <Breadcrumb style={{ textTransform: "capitalize" }} items={items} />

        <Flex justify="center">
          <Title>{getTitle()}</Title>
        </Flex>
      </Flex>

      <Content>
        {!!albumId && <Outlet />}

        {!albumId && (
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
        )}
      </Content>
    </Layout>
  );
};
