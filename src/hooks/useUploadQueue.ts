import { uploadImageFile } from "@/services/commonServices";
import { UploadCommonResponse } from "@/types/event";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UploadQueueStatus = "queued" | "uploading" | "success" | "error";

export type UploadQueueItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: UploadQueueStatus;
  response?: UploadCommonResponse;
  error?: string;
};

type UploadQueueOptions = {
  concurrency?: number;
  type?: "event" | "image";
  maxFiles?: number;
  acceptedTypes?: string[];
};

type AddFilesResult = {
  added: number;
  rejectedByType: number;
  rejectedByLimit: number;
};

const buildFileId = (file: File) =>
  `${file.name}_${file.size}_${file.lastModified}`;

export const useUploadQueue = ({
  concurrency = 4,
  type = "image",
  maxFiles = 500,
  acceptedTypes,
}: UploadQueueOptions = {}) => {
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const itemsRef = useRef(items);
  const activeCountRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const addFiles = useCallback(
    (files: File[]): AddFilesResult => {
      const existingIds = new Set(itemsRef.current.map((item) => item.id));
      let added = 0;
      let rejectedByType = 0;
      let rejectedByLimit = 0;
      let currentCount = itemsRef.current.length;

      const nextItems: UploadQueueItem[] = [];

      files.forEach((file) => {
        if (currentCount >= maxFiles) {
          rejectedByLimit += 1;
          return;
        }

        if (acceptedTypes?.length && !acceptedTypes.includes(file.type)) {
          rejectedByType += 1;
          return;
        }

        const id = buildFileId(file);
        if (existingIds.has(id)) return;

        existingIds.add(id);
        currentCount += 1;
        added += 1;
        nextItems.push({
          id,
          file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "queued",
        });
      });

      if (nextItems.length) {
        setItems((prev) => [...prev, ...nextItems]);
      }

      return { added, rejectedByType, rejectedByLimit };
    },
    [acceptedTypes, maxFiles]
  );

  const updateItem = useCallback(
    (id: string, updater: (item: UploadQueueItem) => UploadQueueItem) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updater(item) : item))
      );
    },
    []
  );

  const uploadItem = useCallback(
    async (item: UploadQueueItem) => {
      updateItem(item.id, (current) => ({
        ...current,
        status: "uploading",
        error: undefined,
      }));

      try {
        const response = await uploadImageFile(item.file, {
          type,
          onProgress: (percent) => {
            updateItem(item.id, (current) => ({
              ...current,
              progress: percent,
              status: "uploading",
            }));
          },
        });

        updateItem(item.id, (current) => ({
          ...current,
          progress: 100,
          status: "success",
          response,
        }));
      } catch (error: unknown) {
        updateItem(item.id, (current) => ({
          ...current,
          status: "error",
          error: (error as { message?: string })?.message || "Erro ao enviar arquivo",
        }));
      }
    },
    [type, updateItem]
  );

  const startNextUploads = useCallback(() => {
    const availableSlots = concurrency - activeCountRef.current;
    if (availableSlots <= 0) return;

    const queuedItems = itemsRef.current.filter(
      (item) => item.status === "queued"
    );

    queuedItems.slice(0, availableSlots).forEach((item) => {
      activeCountRef.current += 1;
      uploadItem(item).finally(() => {
        activeCountRef.current -= 1;
        startNextUploads();
      });
    });
  }, [concurrency, uploadItem]);

  useEffect(() => {
    startNextUploads();
  }, [items, startNextUploads]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id || item.status === "uploading")
    );
  }, []);

  const retryItem = useCallback((id: string) => {
    updateItem(id, (current) => ({
      ...current,
      status: "queued",
      progress: 0,
      error: undefined,
    }));
  }, [updateItem]);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const stats = useMemo(() => {
    const summary = {
      total: items.length,
      queued: 0,
      uploading: 0,
      success: 0,
      error: 0,
    };

    items.forEach((item) => {
      summary[item.status] += 1;
    });

    return summary;
  }, [items]);

  const totalProgress = useMemo(() => {
    if (!items.length) return 0;
    const total = items.reduce((acc, item) => acc + item.progress, 0);
    return Math.round(total / items.length);
  }, [items]);

  const hasActiveUploads = useMemo(
    () => items.some((item) => item.status === "queued" || item.status === "uploading"),
    [items]
  );

  const hasErrors = useMemo(
    () => items.some((item) => item.status === "error"),
    [items]
  );

  return {
    items,
    addFiles,
    removeItem,
    retryItem,
    clearAll,
    stats,
    totalProgress,
    hasActiveUploads,
    hasErrors,
  };
};
