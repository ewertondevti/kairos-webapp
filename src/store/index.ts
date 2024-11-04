import firebaseDB from "@/firebase";
import { AddDocumentPayload } from "@/types/store";
import { doc, setDoc } from "firebase/firestore";

export const addDocument = async ({
  collectionId,
  documentId,
  data,
}: AddDocumentPayload) => {
  const result = await setDoc(doc(firebaseDB, collectionId), data);
  return result;
};
