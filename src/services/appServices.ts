import firebaseDB from "@/firebase";
import { ImageResult, ImageType } from "@/types/store";
import { collection, getDocs } from "firebase/firestore";

export const getImages = async (): Promise<ImageResult[]> => {
  const querySnapshot = await getDocs(collection(firebaseDB, "images"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    image: (doc.data() as ImageType).image,
  }));
};
