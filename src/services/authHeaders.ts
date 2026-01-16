import { firebaseAuth } from "@/firebase";

export const getAuthHeaders = async () => {
  const user = firebaseAuth?.currentUser;
  if (!user) {
    return {};
  }

  const token = await user.getIdToken(true);
  return {
    Authorization: `Bearer ${token}`,
  };
};
