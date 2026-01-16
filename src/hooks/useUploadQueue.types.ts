import { UploadCommonResponse } from "@/types/event";

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

export type UploadQueueOptions = {
  concurrency?: number;
  type?: "event" | "image";
  maxFiles?: number;
  acceptedTypes?: string[];
};

export type AddFilesResult = {
  added: number;
  rejectedByType: number;
  rejectedByLimit: number;
};
