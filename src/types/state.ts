export type AppState = {
  albumModalOpen: boolean;
  imageUrl?: string;
  selectedImages: string[];
  mode: "default" | "select";
  updateImageUrl: (id: string) => void;
  toogleAlbumModal: (open: boolean) => void;
  updateSelectedImages: (urls: string[]) => void;
  updateMode: (mode: AppState["mode"]) => void;
};
