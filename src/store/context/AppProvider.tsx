import { AppState } from "@/types/state";
import { createContext, FC, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

const initialState: AppState = {
  albumModalOpen: false,
  selectedImages: [],
  mode: "default",
  updateImageUrl: () => {},
  toogleAlbumModal: () => {},
  updateSelectedImages: () => {},
  updateMode: () => {},
};

export const AppContext = createContext<AppState>(initialState);

const AppProvider: FC<Props> = ({ children }) => {
  const [imageId, setImageId] = useState("");
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [mode, setMode] = useState<AppState["mode"]>("default");

  const updateImageUrl: AppState["updateImageUrl"] = (id) => setImageId(id);

  const toogleAlbumModal: AppState["toogleAlbumModal"] = (open) =>
    setAlbumModalOpen(open);

  const updateSelectedImages: AppState["updateSelectedImages"] = (urls) =>
    setSelectedImages(urls);

  const updateMode: AppState["updateMode"] = (mode) => setMode(mode);

  return (
    <AppContext.Provider
      value={{
        imageUrl: imageId,
        albumModalOpen,
        selectedImages,
        mode,
        updateImageUrl,
        toogleAlbumModal,
        updateSelectedImages,
        updateMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
