import { UploadCommonResponse } from "@/types/event";

export const getUploadUrl = (response?: UploadCommonResponse) => {
  const url = response?.url;
  if (!url) return "";
  return Array.isArray(url) ? url[0] : url;
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${value} ${sizes[i]}`;
};
