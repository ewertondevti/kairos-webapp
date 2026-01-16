import { IPostalCode } from "@/types/membership";
import axios from "axios";

export const getAddress = async (postalCode: string): Promise<IPostalCode[]> => {
  try {
    const response = await axios.get<IPostalCode[]>(
      `/api/address?postalCode=${encodeURIComponent(postalCode)}`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: unknown) {
    console.error("Erro ao buscar endereço:", error);
    return [];
  }
};
