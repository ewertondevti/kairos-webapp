import { IVerse } from "@/types/app";
import axios from "axios";

const VERSES_BASE_URL = "https://www.abibliadigital.com.br/api";
const VERSES_TOKEN = process.env.NEXT_PUBLIC_DEFAULT_USER_TOKEN || "";

const versesApi = axios.create({
  baseURL: VERSES_BASE_URL,
  headers: {
    Authorization: `Bearer ${VERSES_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export const getRandomVerse = async (): Promise<IVerse> => {
  try {
    const response = await versesApi.get<IVerse>("/verses/acf/random");
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar versículo aleatório:", error);
    throw error;
  }
};

export const getVerse = async (
  abbrev: string,
  chapter: string,
  verse: string
): Promise<IVerse> => {
  try {
    const response = await versesApi.get<IVerse>(
      `/verses/acf/${abbrev}/${chapter}/${verse}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar versículo:", error);
    throw error;
  }
};
