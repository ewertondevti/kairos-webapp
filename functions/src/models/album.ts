import * as admin from "firebase-admin";

export interface IImage {
  id?: string;
  url?: string;
  name: string;
  storagePath?: string;
}

export interface IAlbum {
  name: string;
  eventDate?: string;
  images: Partial<IImage>[];
  creationDate?: admin.firestore.FieldValue;
  updatedDate?: admin.firestore.FieldValue;
}
