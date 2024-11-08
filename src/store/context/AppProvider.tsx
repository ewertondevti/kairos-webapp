import { AppState } from "@/types/state";
import { ImageResult } from "@/types/store";
import { createContext, FC, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

const initialState: AppState = {
  albumModalOpen: false,
  selectedImages: [],
  mode: "default",
  view: "default",
  updateImageUrl: () => {},
  toogleAlbumModal: () => {},
  updateSelectedImages: () => {},
  updateMode: () => {},
  updateView: () => {},
};

export const AppContext = createContext<AppState>(initialState);

const AppProvider: FC<Props> = ({ children }) => {
  const [imageId, setImageId] = useState("");
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageResult[]>([]);
  const [mode, setMode] = useState<AppState["mode"]>("default");
  const [view, setView] = useState<AppState["view"]>("default");

  const updateImageUrl: AppState["updateImageUrl"] = (id) => setImageId(id);

  const toogleAlbumModal: AppState["toogleAlbumModal"] = (open) =>
    setAlbumModalOpen(open);

  const updateSelectedImages: AppState["updateSelectedImages"] = (urls) =>
    setSelectedImages(urls);

  const updateMode: AppState["updateMode"] = (mode) => setMode(mode);
  const updateView: AppState["updateView"] = (view) => setView(view);

  return (
    <AppContext.Provider
      value={{
        imageUrl: imageId,
        albumModalOpen,
        selectedImages,
        mode,
        view,
        updateImageUrl,
        toogleAlbumModal,
        updateSelectedImages,
        updateMode,
        updateView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
