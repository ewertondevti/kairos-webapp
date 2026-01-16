import { getAlbumById, getAlbums } from "@/services/albumServices";
import { getEvents } from "@/services/eventServices";
import { getUserProfile, getUsers } from "@/services/userServices";
import { getVerse } from "@/services/versesServices";
import { IAlbumWithCursor } from "@/types/store";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { QueryNames } from "./queryNames";

type AlbumQueryOptions = {
  enabled?: boolean;
};

type AlbumPageOptions = {
  enabled?: boolean;
  limit?: number;
};

export const useGetAlbums = (options?: AlbumQueryOptions) => {
  return useQuery({
    queryKey: [QueryNames.GetAlbums],
    queryFn: async () => await getAlbums(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
};

export const useGetAlbumById = (
  id?: string,
  options?: AlbumPageOptions
) => {
  return useQuery({
    queryKey: [QueryNames.GetAlbumById, id, options?.limit],
    queryFn: async () => await getAlbumById(id!, { limit: options?.limit }),
    enabled: !!id && (options?.enabled ?? true),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetAlbumImagesInfinite = (
  id?: string,
  options?: AlbumPageOptions & { initialPage?: IAlbumWithCursor }
) => {
  const limit = options?.limit ?? 24;

  return useInfiniteQuery({
    queryKey: [QueryNames.GetAlbumById, id, "images", limit],
    queryFn: async ({ pageParam }) =>
      getAlbumById(id!, { limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: !!id && (options?.enabled ?? true),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initialData: options?.initialPage
      ? {
          pageParams: [undefined],
          pages: [options.initialPage],
        }
      : undefined,
  });
};

export const useGetEvents = () => {
  return useQuery({
    queryKey: [QueryNames.GetEvents],
    queryFn: async () => await getEvents(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetVerse = (abbrev: string, chapter: string, verse: string) => {
  return useQuery({
    queryKey: [QueryNames.GetVerse, abbrev, chapter, verse],
    queryFn: async () => await getVerse(abbrev, chapter, verse),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetUsers = (enabled = true) => {
  return useQuery({
    queryKey: [QueryNames.GetUsers],
    queryFn: async () => await getUsers(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useGetUserProfile = (enabled = true) => {
  return useQuery({
    queryKey: [QueryNames.GetUserProfile],
    queryFn: async () => await getUserProfile(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled,
  });
};
