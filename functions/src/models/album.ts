import * as admin from "firebase-admin";

export interface IImage {
  id: string;
  url: string;
  name: string;
}

export interface IAlbum {
  name: string;
  images: Partial<IImage>[];
  creationDate?: admin.firestore.FieldValue;
  updatedDate?: admin.firestore.FieldValue;
}
