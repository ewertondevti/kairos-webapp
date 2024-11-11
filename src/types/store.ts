export type CommonType = {
  id?: string;
};

export type ImageType = {
  url: string;
  name: string;
};

export type AlbumType = {
  name: string;
  images?: ImageResult[];
};

export type ImageResult = ImageType & CommonType;
export type AlbumResult = AlbumType & CommonType;
export type PresentationResult = ImageType & CommonType;
export type EventResult = ImageType & CommonType;

export type AddDocumentPayload = {
  collectionId: string;
  documentId?: string;
  data: any;
};
