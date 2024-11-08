import { ImageResult } from "./store";

export type AppState = {
  albumModalOpen: boolean;
  imageUrl?: string;
  selectedImages: ImageResult[];
  mode: "default" | "select";
  view: "small" | "default" | "large";
  updateImageUrl: (id: string) => void;
  toogleAlbumModal: (open: boolean) => void;
  updateSelectedImages: (images: ImageResult[]) => void;
  updateMode: (mode: AppState["mode"]) => void;
  updateView: (mode: AppState["view"]) => void;
};
