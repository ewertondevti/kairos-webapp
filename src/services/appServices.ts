import { DatabaseTableKeys } from "@/enums/app";
import firebaseDB from "@/firebase";
import {
  IAlbum,
  IAlbumDTO,
  IEventDTO,
  IImage,
  IPresentationDTO,
} from "@/types/store";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export const getAlbums = async (): Promise<IAlbumDTO[]> => {
  const querySnapshot = await getDocs(
    collection(firebaseDB, DatabaseTableKeys.Albums)
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as IAlbum),
  }));
};

export const getAlbumById = async (
  id: string
): Promise<IAlbumDTO | undefined> => {
  const docSnap = await getDoc(doc(firebaseDB, "albums", id));

  if (docSnap.exists())
    return { id: docSnap.id, ...(docSnap.data() as IAlbum) };

  return;
};

export const getPresentations = async (): Promise<IPresentationDTO[]> => {
  const querySnapshot = await getDocs(
    collection(firebaseDB, DatabaseTableKeys.Presentations)
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as IImage),
  }));
};

export const getEvents = async (): Promise<IEventDTO[]> => {
  const querySnapshot = await getDocs(
    collection(firebaseDB, DatabaseTableKeys.Events)
  );

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as IImage),
  }));
};
