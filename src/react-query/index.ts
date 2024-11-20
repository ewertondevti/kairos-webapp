import { getAlbumById, getAlbums } from "@/services/albumServices";
import { getEvents } from "@/services/eventServices";
import { getVerse } from "@/services/versesServices";
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
    queryKey: [QueryNames.GetAlbumById, id],
    queryFn: async () => await getAlbumById(id!),
    enabled: !!id,
  });
};

export const useGetEvents = () => {
  return useQuery({
    queryKey: [QueryNames.GetEvents],
    queryFn: async () => await getEvents(),
  });
};

export const useGetVerse = (abbrev: string, chapter: string, verse: string) => {
  return useQuery({
    queryKey: [QueryNames.GetVerse, abbrev, chapter, verse],
    queryFn: async () => await getVerse(abbrev, chapter, verse),
  });
};
