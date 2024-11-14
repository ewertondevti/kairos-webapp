import { ICommonDTO } from "./store";

export type AppState = {
  editAlbumOpen: boolean;
  imageUrl?: string;
  selectedImages: ICommonDTO[];
  mode: "default" | "select";
  view: "small" | "default" | "large";
  updateImageUrl: (id: string) => void;
  toogleEditAlbumModal: (open: boolean) => void;
  updateSelectedImages: (images: ICommonDTO[]) => void;
  updateMode: (mode: AppState["mode"]) => void;
  updateView: (mode: AppState["view"]) => void;
};
