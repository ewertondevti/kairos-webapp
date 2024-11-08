import { TabsProps } from "antd";
import { AlbumsTab } from "./AlbumsTab";
import { AllPhotosTab } from "./AllPhotosTab";

export const galleryTabs: TabsProps["items"] = [
  {
    key: "all",
    label: "Todas as fotos",
    children: <AllPhotosTab />,
  },
  {
    key: "albuns",
    label: "Álbuns",
    children: <AlbumsTab />,
  },
  {
    key: "presentation",
    label: "Apresentação",
    children: <></>,
  },
  {
    key: "events",
    label: "Próximos eventos",
    children: <></>,
  },
];
