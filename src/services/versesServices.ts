import { IVerse, User } from "@/types/app";
import api from "./httpClient";

export const getUser = async () => {
  const { data } = await api.get<User>(
    `/users/${import.meta.env.VITE_DEFAULT_USER_EMAIL}`
  );
  return data;
};

export const getRandomVerse = async () => {
  const { data } = await api.get<IVerse>(`/verses/acf/random`);
  return data;
};

export const getVerse = async (
  abbrev: string,
  chapter: string,
  verse: string
) => {
  const { data } = await api.get<IVerse>(
    `/verses/acf/${abbrev}/${chapter}/${verse}`
  );
  return data;
};
