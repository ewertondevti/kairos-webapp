import { getImages } from "@/services/appServices";
import { useQuery } from "@tanstack/react-query";

export const useGetImages = () => {
  return useQuery({
    queryKey: ["GetImages"],
    queryFn: async () => await getImages(),
  });
};
