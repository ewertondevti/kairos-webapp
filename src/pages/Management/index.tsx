"use client";

import { EditAlbumModal } from "@/components/EditAlbumModal";
import { TopBar } from "@/components/TopBar";
import { ManagementRoutesEnums } from "@/enums/routesEnums";
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
  Flex,
  Image,
  Layout,
  Space,
  Tabs,
  TabsProps,
} from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { usePathname, useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";
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

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <Flex gap={16} vertical className="mb-8">

          <Flex justify={mode === "select" ? "space-between" : "flex-start"} align="center">
            <Title 
              level={1} 
              className="text-4xl font-semibold text-[#0a0a0a] mb-0"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: "-0.02em" }}
            >
              Gerenciamento
            </Title>

            {mode === "select" && (
              <span 
                className="text-lg font-medium"
                style={{ 
                  fontFamily: 'var(--font-poppins), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  color: "#4a4a4a",
                }}
              >
              Selecionados: {selectedImages.length}
            </span>
            )}
          </Flex>

          <TopBar />
        </Flex>

        <div>
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
                    children: (
                      <AlbumsTab
                        albumId={
                          pathname.includes("/albums/")
                            ? pathname.split("/").pop()
                            : undefined
                        }
                      />
                    ),
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
                className="[&_.ant-tabs-tab]:text-[#4a4a4a] [&_.ant-tabs-tab-active]:text-[#1a5d2e] [&_.ant-tabs-tab]:font-medium"
              />
            )}
          </Image.PreviewGroup>
        </div>

        <EditAlbumModal />
      </div>
    </div>
  );
};

export default Management;
