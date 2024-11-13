import { IImageDTO } from "./store";

export type AppState = {
  editAlbumOpen: boolean;
  imageUrl?: string;
  selectedImages: IImageDTO[];
  mode: "default" | "select";
  view: "small" | "default" | "large";
  updateImageUrl: (id: string) => void;
  toogleEditAlbumModal: (open: boolean) => void;
  updateSelectedImages: (images: IImageDTO[]) => void;
  updateMode: (mode: AppState["mode"]) => void;
  updateView: (mode: AppState["view"]) => void;
};
