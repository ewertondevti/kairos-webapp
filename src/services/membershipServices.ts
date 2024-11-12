import { IPostalCode } from "@/types/membership";
import api from "./httpClient";

export const getAddress = async (postalCode: string) => {
  const appId = import.meta.env.VITE_PTCP_APP_ID;

  const { data } = await api.get<IPostalCode[]>(
    `https://api.duminio.com/ptcp/v2/${appId}/${postalCode.replace("-", "")}`,
    { withCredentials: false }
  );

  return data;
};
