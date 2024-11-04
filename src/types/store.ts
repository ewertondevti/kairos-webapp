export type CommonType = {
  id: string;
};

export type ImageType = {
  image: string;
};

export type ImageResult = ImageType & CommonType;

export type AddDocumentPayload = {
  collectionId: string;
  documentId?: string;
  data: any;
};
