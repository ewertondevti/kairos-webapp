import {
  getAlbums,
  getEvents,
  getImages,
  getPresentations,
} from "@/services/appServices";
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
    queryKey: [QueryNames.GetAlbums],
    queryFn: async () => await getAlbums(),
  });
};

export const useGetPresentations = () => {
  return useQuery({
    queryKey: [QueryNames.GetPresentations],
    queryFn: async () => await getPresentations(),
  });
};

export const useGetEvents = () => {
  return useQuery({
    queryKey: [QueryNames.GetEvents],
    queryFn: async () => await getEvents(),
  });
};
