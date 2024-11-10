import { ManagementRoutesEnums } from "@/enums/routesEnums";
import { TabsProps } from "antd";
import { Outlet } from "react-router-dom";

export const managementTabs: TabsProps["items"] = [
  {
    key: ManagementRoutesEnums.AllPhotos,
    label: "Todas as fotos",
    children: <Outlet />,
  },
  {
    key: ManagementRoutesEnums.Albums,
    label: "Álbuns",
    children: <Outlet />,
  },
  {
    key: ManagementRoutesEnums.Presentation,
    label: "Apresentação",
    children: <Outlet />,
  },
  {
    key: ManagementRoutesEnums.Events,
    label: "Próximos eventos",
    children: <Outlet />,
  },
];
