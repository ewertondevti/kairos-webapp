import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { useGetAlbums } from "@/react-query";
import { Breadcrumb, BreadcrumbProps, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Outlet, useLocation } from "react-router-dom";
import { CustomHeader } from "../CustomHeader";
import "./AppLayout.scss";

const AppLayout = () => {
  const { pathname } = useLocation();

  const { data: albums } = useGetAlbums();

  const keys = pathname.split("/").filter(Boolean);

  const getLabel = (key: string) => {
    const album = albums?.find((a) => a.id === key);

    switch (key) {
      case RoutesEnums.Management:
        return "Gerenciamento";
      case ManagementRoutesEnums.AllPhotos:
        return "Todas as fotos";
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
    <Layout className="layout__app">
      <CustomHeader />

      <Content className="layout__app-content">
        <Breadcrumb style={{ textTransform: "capitalize" }} items={items} />

        <Outlet />
      </Content>
    </Layout>
  );
};

export default AppLayout;
