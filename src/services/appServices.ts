import firebaseDB from "@/firebase";
import { AlbumResult, AlbumType, ImageResult, ImageType } from "@/types/store";
import { collection, getDocs } from "firebase/firestore";

export const getImages = async (): Promise<ImageResult[]> => {
  const querySnapshot = await getDocs(collection(firebaseDB, "images"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ImageType),
  }));
};

export const getAlbums = async (): Promise<AlbumResult[]> => {
  const querySnapshot = await getDocs(collection(firebaseDB, "albums"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AlbumType),
  }));
};
