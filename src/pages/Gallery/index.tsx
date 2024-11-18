import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { onDownload } from "@/helpers/app";
import { useGetAlbums } from "@/react-query";
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  BreadcrumbProps,
  Empty,
  Flex,
  Image,
  Layout,
  Space,
  Spin,
} from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { AlbumContent } from "../Management/tabs/AlbumsTab/AlbumContent";

export const Gallery = () => {
  const { pathname } = useLocation();
  const { id: albumId } = useParams();
  const { data: albums, isLoading } = useGetAlbums();

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
    const title = "Galeria";

    if (albumId && albums) {
      const album = albums.find((a) => a.id === albumId);

      if (album) return album?.name;
      return title;
    }

    return title;
  };

  return (
    <Layout style={{ padding: 20 }} className="height-100perc">
      <Flex gap={16} vertical>
        <Breadcrumb style={{ textTransform: "capitalize" }} items={items} />

        <Flex justify="center">
          <Title>{getTitle()}</Title>
        </Flex>
      </Flex>

      <Content>
        {!albums?.length && (
          <Flex justify="center">
            <Spin spinning={isLoading}>
              <Empty />
            </Spin>
          </Flex>
        )}

        {!!albumId && (
          <Image.PreviewGroup
            preview={{
              toolbarRender: (
                _,
                {
                  image,
                  transform: { scale },
                  actions: { onActive, onZoomOut, onZoomIn, onReset },
                }
              ) => {
                return (
                  <Space size={12} className="toolbar-wrapper">
                    <LeftOutlined
                      onClick={() => onActive?.(-1)}
                      title="Voltar"
                    />
                    <RightOutlined
                      onClick={() => onActive?.(1)}
                      title="Próxima"
                    />
                    <DownloadOutlined
                      onClick={onDownload(image.url)}
                      title="Fazer download da imagem"
                    />
                    <ZoomOutOutlined
                      disabled={scale === 1}
                      onClick={onZoomOut}
                      title="Diminuir zoom"
                    />
                    <ZoomInOutlined
                      disabled={scale === 50}
                      onClick={onZoomIn}
                      title="Aumentar zoom"
                    />
                    <UndoOutlined onClick={onReset} title="Resetar tudo" />
                  </Space>
                );
              },
            }}
          >
            <Outlet />
          </Image.PreviewGroup>
        )}

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
