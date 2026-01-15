import { DatabaseTableKeys } from "@/enums/app";
import { convertFileToBase64 } from "@/helpers/app";
import { UploadCommonResponse } from "@/types/event";
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
    const response = await fetch(`/api/upload/delete?imagePath=${encodeURIComponent(imagePath)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar imagem");
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    throw error;
  }
};

export const onImageUpload =
  (dbKey: DatabaseTableKeys): UploadProps["customRequest"] =>
  async ({ file, onProgress, onSuccess, onError }) => {
    const base64img = (await convertFileToBase64(file as RcFile)) as string;

    const type = dbKey === DatabaseTableKeys.Events ? "event" : "image";

    const payload = {
      file: base64img,
      fileName: (file as RcFile).name,
      mimeType: (file as RcFile).type,
      type,
    };

    try {
      // Simulate progress for fetch API
      if (onProgress) {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          onProgress({ percent: 50 });
        }, 100);
        
        setTimeout(() => clearInterval(progressInterval), 500);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      const data: UploadCommonResponse = await response.json();

      if (onProgress) {
        onProgress({ percent: 100 });
      }

      if (onSuccess) {
        onSuccess(data, file);
      }
    } catch (error: any) {
      console.error("Erro no upload:", error);
      if (onError) onError(error);
    }
  };
