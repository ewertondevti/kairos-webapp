export interface IImage {
  id: string;
  url: string;
  name: string;
}

export interface IAlbum {
  id: string;
  name: string;
  images: Partial<IImage>[];
}
