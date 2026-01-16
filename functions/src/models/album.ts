import * as admin from "firebase-admin";

export interface IAlbumImage {
  id?: string;
  name: string;
  storagePath: string;
  createdAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

export interface IAlbum {
  name: string;
  eventDate?: string;
  imagesCount: number;
  coverImageName?: string;
  creationDate?: admin.firestore.FieldValue;
  updatedDate?: admin.firestore.FieldValue;
}
