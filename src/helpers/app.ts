import { IImageDTO } from "@/types/store";
import { message } from "antd";
import { RcFile } from "antd/es/upload";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import Cookies from "universal-cookie";

export function getCookie<T>(key: string) {
  const cookies = new Cookies(null, { path: "/" });
  return cookies.get<T>(`kp-${key}`);
}

export const setCookie = (key: string, value: any) => {
  const cookies = new Cookies(null, { path: "/" });
  cookies.set(`kp-${key}`, value);
};

export const removeCookie = (key: string) => {
  const cookies = new Cookies(null, { path: "/" });
  cookies.remove(`kp-${key}`);
};

export const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("Só é permitido imagens JPEG/PNG!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Imagem tem que ser menor que 2MB!");
  }
  return false;
};

export const convertFileToBase64 = (file: RcFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file); // Converte o arquivo em base64
  });
};

export const onDownload = (url: string) => async () => {
  const lastString = url.split("/").filter(Boolean).pop();
  const name = lastString?.split("?").shift() ?? "IMG_KAIROS";
  const filename = decodeURIComponent(name);

  if (url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      message.error("Erro ao fazer download da imagem");
    }
  }
};

const sanitizeFilename = (name: string, fallback: string) => {
  const normalized = name?.trim() ? name.trim() : fallback;
  return normalized.replace(/[<>:"/\\|?*\x00-\x1F]/g, "-");
};

const ensureUniqueFilename = (
  filename: string,
  counter: Map<string, number>
) => {
  if (!counter.has(filename)) {
    counter.set(filename, 1);
    return filename;
  }

  const current = counter.get(filename) ?? 1;
  const next = current + 1;
  counter.set(filename, next);

  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex > 0) {
    const base = filename.slice(0, dotIndex);
    const ext = filename.slice(dotIndex);
    return `${base} (${next})${ext}`;
  }

  return `${filename} (${next})`;
};

export const downloadImagesAsZip = async (
  images: IImageDTO[],
  zipName: string
) => {
  if (!images.length) {
    message.warning("Nenhuma imagem para download.");
    return;
  }

  const zip = new JSZip();
  const usedNames = new Map<string, number>();

  try {
    await Promise.all(
      images.map(async (image, index) => {
        if (!image.url) return;
        const fallback = `imagem-${index + 1}`;
        const safeName = sanitizeFilename(image.name || fallback, fallback);
        const uniqueName = ensureUniqueFilename(safeName, usedNames);
        const response = await fetch(image.url);
        const blob = await response.blob();
        zip.file(uniqueName, blob);
      })
    );

    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    const safeZipName = sanitizeFilename(zipName || "album", "album");
    saveAs(content, `${safeZipName}.zip`);
  } catch (error) {
    console.error("Erro ao gerar ZIP:", error);
    message.error("Erro ao gerar o download do álbum.");
  }
};
