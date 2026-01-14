import { IVerse, User } from "@/types/app";
import { AxiosHeaders } from "axios";
import api from "./httpClient";

const url = "https://www.abibliadigital.com.br/api";

const headers = new AxiosHeaders().set(
  "Authorization",
  `Bearer ${process.env.NEXT_PUBLIC_DEFAULT_USER_TOKEN || ''}`
);

export const getUser = async () => {
  const { data } = await api.get<User>(
    `${url}/users/${process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || ''}`,
    { headers }
  );
  return data;
};

export const getRandomVerse = async () => {
  const { data } = await api.get<IVerse>(`${url}/verses/acf/random`, {
    headers,
  });
  return data;
};

export const getVerse = async (
  abbrev: string,
  chapter: string,
  verse: string
) => {
  const { data } = await api.get<IVerse>(
    `${url}/verses/acf/${abbrev}/${chapter}/${verse}`,
    { headers }
  );
  return data;
};
