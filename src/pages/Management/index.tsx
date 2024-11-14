import { EditAlbumModal } from "@/components/EditAlbumModal";
import { TopBar } from "@/components/TopBar";
import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { useGetAlbums } from "@/react-query";
import api from "@/services/httpClient";
import { useAppState } from "@/store";
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
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
import { saveAs } from "file-saver";
import { isMobile } from "react-device-detect";
import { useLocation, useNavigate } from "react-router-dom";
import "./Management.scss";
import { managementTabs } from "./tabs/management.tabs";

const Management = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: albums } = useGetAlbums();

  const { selectedImages, mode, updateMode, updateSelectedImages } =
    useAppState();

  const defaultKey = pathname.split("/").filter(Boolean)[1];

  const onDownload = (url: string) => () => {
    const strings = url.split("/");
    const lastString = strings[strings.length - 1].split("?")[0];
    const filename = decodeURIComponent(lastString.split("%2F")[1]);

    if (url) {
      api
        .get<Blob>(url, { responseType: "blob" })
        .then(({ data }) => saveAs(data, filename));
    }
  };

  const onChange: TabsProps["onChange"] = (key) => {
    updateMode("default");
    updateSelectedImages([]);
    navigate(key);
  };

  const keys = pathname.split("/").filter(Boolean);

  const getLabel = (key: string) => {
    const album = albums?.find((a) => a.id === key);

    switch (key) {
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

  return (
    <Layout style={{ height: "100%", padding: isMobile ? 8 : 20 }}>
      <Flex gap={16} vertical>
        <Breadcrumb style={{ textTransform: "capitalize" }} items={items} />

        <Flex justify={mode === "select" ? "space-between" : "flex-start"}>
          <Title style={{ margin: 0 }}>Gerenciamento</Title>

          {mode === "select" && (
            <small className="small-text">
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
                actions: {
                  onActive,
                  onFlipY,
                  onFlipX,
                  onRotateLeft,
                  onRotateRight,
                  onZoomOut,
                  onZoomIn,
                  onReset,
                },
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
                  <SwapOutlined
                    rotate={90}
                    onClick={onFlipY}
                    title="Inverter imagem de cima para baixo"
                  />
                  <SwapOutlined
                    onClick={onFlipX}
                    title="Inverter imagem da esquerda para a direita"
                  />
                  <RotateLeftOutlined
                    onClick={onRotateLeft}
                    title="Girar imagem para a esquerda"
                  />
                  <RotateRightOutlined
                    onClick={onRotateRight}
                    title="Girar imagem para a direita"
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
          <Tabs
            items={managementTabs}
            defaultActiveKey={defaultKey}
            destroyInactiveTabPane
            onChange={onChange}
            className="management__container"
          />
        </Image.PreviewGroup>
      </Content>

      <EditAlbumModal />
    </Layout>
  );
};

export default Management;
