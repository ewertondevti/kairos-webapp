import {
  getAlbumById,
  getAlbumImages,
  getAlbums,
  getAlbumsPaged,
} from "@/services/albumServices";
import { getEvents } from "@/services/eventServices";
import { getAuditLogs } from "@/services/auditService";
import { getStorageImages } from "@/services/storageServices";
import {
  getAccessRequests,
  getAuthUsers,
  getUserProfile,
  getUsers,
  getUsersWithoutAuth,
} from "@/services/userServices";
import { getVerse } from "@/services/versesServices";
import { IAlbumWithCursor } from "@/types/store";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { QueryNames } from "./queryNames";
import { AlbumPageOptions, AlbumQueryOptions } from "./types";

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

export const useGetAlbumsInfinite = (options?: AlbumPageOptions) => {
  const limit = options?.limit ?? 24;

  return useInfiniteQuery({
    queryKey: [QueryNames.GetAlbumsPaged, limit],
    queryFn: async ({ pageParam }) =>
      getAlbumsPaged({ limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: options?.enabled ?? true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
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

export const useGetAlbumImagesIndexInfinite = (
  options?: AlbumPageOptions
) => {
  const limit = options?.limit ?? 48;

  return useInfiniteQuery({
    queryKey: [QueryNames.GetAlbumImages, limit],
    queryFn: async ({ pageParam }) =>
      getAlbumImages({ limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: options?.enabled ?? true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
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

export const useGetStorageImages = () => {
  return useQuery({
    queryKey: [QueryNames.GetStorageImages],
    queryFn: async () => await getStorageImages(),
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

export const useGetAuthUsers = (enabled = true) => {
  return useQuery({
    queryKey: [QueryNames.GetAuthUsers],
    queryFn: async () => await getAuthUsers(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useGetUsersWithoutAuth = (enabled = true) => {
  return useQuery({
    queryKey: [QueryNames.GetUsersWithoutAuth],
    queryFn: async () => await getUsersWithoutAuth(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useGetAccessRequests = (enabled = true) => {
  return useQuery({
    queryKey: [QueryNames.GetAccessRequests],
    queryFn: async () => await getAccessRequests(),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useGetAuditLogs = (limit = 200, enabled = true) => {
  return useQuery({
    queryKey: [QueryNames.GetAuditLogs, limit],
    queryFn: async () => await getAuditLogs(limit),
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
