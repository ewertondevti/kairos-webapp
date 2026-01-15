import { IVerse } from "@/types/app";

export const getRandomVerse = async (): Promise<IVerse> => {
  try {
    const response = await fetch("/api/verses?type=random", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar versículo aleatório");
    }

    return response.json();
  } catch (error: any) {
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
    const response = await fetch(
      `/api/verses?abbrev=${abbrev}&chapter=${chapter}&verse=${verse}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar versículo");
    }

    return response.json();
  } catch (error: any) {
    console.error("Erro ao buscar versículo:", error);
    throw error;
  }
};
