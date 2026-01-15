import { DatabaseTableKeys } from "@/enums/app";
import { UploadCommonResponse } from "@/types/event";
import axios from "axios";
import { UploadProps } from "antd";
import { RcFile } from "antd/es/upload";

export const onRemoveImage =
  (dbKey: DatabaseTableKeys): UploadProps["onRemove"] =>
  async ({ name }) => {
    return deleteUploadedImage(`${dbKey}/${name}`)
      .then(() => Promise.resolve())
      .catch((error) => Promise.reject(error));
  };

export const deleteUploadedImage = async (imagePath: string) => {
  try {
    const response = await axios.delete("/api/upload/delete", {
      params: { imagePath },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    throw error;
  }
};

export const uploadImageFile = async (
  file: File,
  options?: {
    type?: "event" | "image";
    onProgress?: (percent: number) => void;
  }
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("mimeType", file.type);
  formData.append("type", options?.type ?? "image");

  const response = await axios.post<UploadCommonResponse>("/api/upload", formData, {
    onUploadProgress: (event) => {
      if (!options?.onProgress) return;
      if (!event.total) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      options.onProgress(percent);
    },
  });

  return response.data;
};

export const onImageUpload =
  (dbKey: DatabaseTableKeys): UploadProps["customRequest"] =>
  async ({ file, onProgress, onSuccess, onError }) => {
    const type = dbKey === DatabaseTableKeys.Events ? "event" : "image";

    try {
      const data = await uploadImageFile(file as RcFile, {
        type,
        onProgress: (percent) => {
          if (onProgress) onProgress({ percent });
        },
      });

      if (onSuccess) {
        onSuccess(data, file);
      }
    } catch (error: unknown) {
      console.error("Erro no upload:", error);
      if (onError) onError(error as Error);
    }
  };
