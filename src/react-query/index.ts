import { getAlbums, getImages } from "@/services/appServices";
import { useQuery } from "@tanstack/react-query";
import { QueryNames } from "./queryNames";

export const useGetImages = () => {
  return useQuery({
    queryKey: [QueryNames.GetImages],
    queryFn: async () => await getImages(),
  });
};

export const useGetAlbums = () => {
  return useQuery({
    queryKey: [QueryNames.GetAlbuns],
    queryFn: async () => await getAlbums(),
  });
};
