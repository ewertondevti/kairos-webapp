import { ImageType } from "@/types/store";
import { RcFile } from "antd/es/upload";

export function getBase64(file: RcFile): Promise<ImageType> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      resolve({
        image: reader.result as string,
        filename: file.name.split(".")[0],
        type: file.type,
      } as ImageType);
    reader.onerror = (error) => reject(error);
  });
}
export const addBase64Prefix = (img?: string) =>
  img && `data:application/octet-stream;base64,${img}`;

export const removeBase64Prefix = (img: string) =>
  img.split(",").slice(1).join("");
