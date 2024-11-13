import {
  getAlbumById,
  getAlbums,
  getEvents,
  getPresentations,
} from "@/services/appServices";
import { useQuery } from "@tanstack/react-query";
import { QueryNames } from "./queryNames";

export const useGetAlbums = () => {
  return useQuery({
    queryKey: [QueryNames.GetAlbums],
    queryFn: async () => await getAlbums(),
  });
};

export const useGetAlbumById = (id?: string) => {
  return useQuery({
    queryKey: [QueryNames.GetAlbumById],
    queryFn: async () => await getAlbumById(id!),
    enabled: !!id,
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
