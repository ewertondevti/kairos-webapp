'use client';

import { EditAlbumModal } from "@/components/EditAlbumModal";
import { TopBar } from "@/components/TopBar";
import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { onDownload } from "@/helpers/app";
import { useGetAlbums } from "@/react-query";
import { useAppState } from "@/store";
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
  Flex,
  Image,
  Layout,
  Space,
  Tabs,
  TabsProps,
} from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { isMobile } from "react-device-detect";
import { usePathname, useRouter } from "next/navigation";
import { AlbumsTab } from "./tabs/AlbumsTab";
import { EventsTab } from "./tabs/EventsTab";

type ManagementProps = {
  children?: React.ReactNode;
};

const Management = ({ children }: ManagementProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data: albums } = useGetAlbums();

  const { selectedImages, mode, updateMode, updateSelectedImages } =
    useAppState();

  const defaultKey = pathname.split("/").filter(Boolean)[1];

  const onChange: TabsProps["onChange"] = (key) => {
    updateMode("default");
    updateSelectedImages([]);
    router.push(`/management/${key}`);
  };

  const keys = pathname.split("/").filter(Boolean);

  const getLabel = (key: string) => {
    const album = albums?.find((a) => a.id === key);

    switch (key) {
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

  return (
    <Layout style={{ padding: isMobile ? 8 : 20 }} className="h-full">
      <Flex gap={16} vertical>
        <Breadcrumb style={{ textTransform: "capitalize" }} items={items} />

        <Flex justify={mode === "select" ? "space-between" : "flex-start"}>
          <Title style={{ margin: 0 }}>Gerenciamento</Title>

          {mode === "select" && (
            <small className="flex items-center justify-center">
              Selecionados: {selectedImages.length}
            </small>
          )}
        </Flex>

        <TopBar />
      </Flex>

      <Content>
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
                  <LeftOutlined onClick={() => onActive?.(-1)} title="Voltar" />
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
          {children ? (
            children
          ) : (
            <Tabs
              items={[
                {
                  key: ManagementRoutesEnums.Albums,
                  label: "Álbuns",
                  children: <AlbumsTab albumId={pathname.includes('/albums/') ? pathname.split('/').pop() : undefined} />,
                },
                {
                  key: ManagementRoutesEnums.Events,
                  label: "Próximos eventos",
                  children: <EventsTab />,
                },
              ]}
              activeKey={defaultKey}
              destroyInactiveTabPane
              onChange={onChange}
              className="h-full [&_.ant-tabs-content]:h-full [&_.ant-tabs-tabpane]:h-full"
            />
          )}
        </Image.PreviewGroup>
      </Content>

      <EditAlbumModal />
    </Layout>
  );
};

export default Management;
