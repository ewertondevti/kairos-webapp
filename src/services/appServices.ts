import { DatabaseTableKeys } from "@/enums/app";
import firebaseDB from "@/firebase";
import {
  AlbumResult,
  AlbumType,
  EventResult,
  ImageResult,
  ImageType,
  PresentationResult,
} from "@/types/store";
import { collection, getDocs } from "firebase/firestore";

export const getImages = async (): Promise<ImageResult[]> => {
  const querySnapshot = await getDocs(
    collection(firebaseDB, DatabaseTableKeys.AllPhotos)
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ImageType),
  }));
};

export const getAlbums = async (): Promise<AlbumResult[]> => {
  const querySnapshot = await getDocs(
    collection(firebaseDB, DatabaseTableKeys.Albums)
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AlbumType),
  }));
};

export const getPresentations = async (): Promise<PresentationResult[]> => {
  const querySnapshot = await getDocs(
    collection(firebaseDB, DatabaseTableKeys.Presentations)
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ImageType),
  }));
};

export const getEvents = async (): Promise<EventResult[]> => {
  const querySnapshot = await getDocs(
    collection(firebaseDB, DatabaseTableKeys.Events)
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ImageType),
  }));
};
