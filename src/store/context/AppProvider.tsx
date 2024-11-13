import { AppState } from "@/types/state";
import { IImageDTO } from "@/types/store";
import { createContext, FC, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

const initialState: AppState = {
  editAlbumOpen: false,
  selectedImages: [],
  mode: "default",
  view: "default",
  updateImageUrl: () => {},
  toogleEditAlbumModal: () => {},
  updateSelectedImages: () => {},
  updateMode: () => {},
  updateView: () => {},
};

export const AppContext = createContext<AppState>(initialState);

const AppProvider: FC<Props> = ({ children }) => {
  const [imageId, setImageId] = useState("");
  const [editAlbumOpen, setEditAlbumModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<IImageDTO[]>([]);
  const [mode, setMode] = useState<AppState["mode"]>("default");
  const [view, setView] = useState<AppState["view"]>("default");

  const updateImageUrl: AppState["updateImageUrl"] = (id) => setImageId(id);

  const toogleEditAlbumModal: AppState["toogleEditAlbumModal"] = (open) =>
    setEditAlbumModalOpen(open);

  const updateSelectedImages: AppState["updateSelectedImages"] = (urls) =>
    setSelectedImages(urls);

  const updateMode: AppState["updateMode"] = (mode) => setMode(mode);
  const updateView: AppState["updateView"] = (view) => setView(view);

  return (
    <AppContext.Provider
      value={{
        imageUrl: imageId,
        editAlbumOpen,
        selectedImages,
        mode,
        view,
        updateImageUrl,
        toogleEditAlbumModal,
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
