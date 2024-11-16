import { message } from "antd";
import { RcFile } from "antd/es/upload";
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
