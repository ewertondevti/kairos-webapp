export type CommonType = {
  id: string;
};

export type ImageType = {
  image: string;
  filename: string;
  type: string;
};

export type CollectionType = {
  name: string;
  date: string;
  images: string[];
};

export type ImageResult = ImageType & CommonType;

export type AddDocumentPayload = {
  collectionId: string;
  documentId?: string;
  data: any;
};
