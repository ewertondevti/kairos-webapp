import { DatabaseTableKeys } from "@/enums/app";
import { convertFileToBase64 } from "@/helpers/app";
import { UploadCommonResponse } from "@/types/event";
import { UploadProps } from "antd";
import { RcFile } from "antd/es/upload";
import api from "./httpClient";

export const onRemoveImage =
  (dbKey: DatabaseTableKeys): UploadProps["onRemove"] =>
  async ({ name }) => {
    return deleteUploadedImage(`${dbKey}/${name}`)
      .then(() => Promise.resolve())
      .catch((error) => Promise.reject(error));
  };

export const deleteUploadedImage = async (imagePath: string) => {
  const { data } = await api.delete("/deleteUploadedImage", {
    params: { imagePath },
  });

  return data;
};

export const onImageUpload =
  (dbKey: DatabaseTableKeys): UploadProps["customRequest"] =>
  async ({ file, onProgress, onSuccess, onError }) => {
    const base64img = (await convertFileToBase64(file as RcFile)) as string;

    const getUri = () => {
      switch (dbKey) {
        case DatabaseTableKeys.Events:
          return "/uploadEvent";

        case DatabaseTableKeys.Images:
          return "/uploadImage";

        default:
          return "";
      }
    };

    const payload = {
      file: base64img,
      fileName: (file as RcFile).name,
      mimeType: (file as RcFile).type,
    };

    try {
      const response = await api.post<UploadCommonResponse>(getUri(), payload, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          if (onProgress) onProgress({ percent: progress });
        },
      });

      if (response.status === 200 && onSuccess) {
        onSuccess(response.data, file);
      } else if (onError) onError(new Error("Erro ao fazer upload."));
    } catch (error: any) {
      console.error("Erro no upload:", error);
      if (onError) onError(error);
    }
  };
