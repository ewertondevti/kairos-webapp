export interface User {
  name: string;
  email: string;
  token: string;
  notifications: boolean;
  lastLogin: string;
}

export interface IVerse {
  book: Book;
  chapter: number;
  number: number;
  text: string;
}

interface Book {
  abbrev: Abbrev;
  name: string;
  author: string;
  group: string;
  version: string;
}

interface Abbrev {
  pt: string;
  en: string;
}
