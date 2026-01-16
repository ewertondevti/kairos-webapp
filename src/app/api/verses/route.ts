import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

const url = "https://www.abibliadigital.com.br/api";
const token = process.env.NEXT_PUBLIC_DEFAULT_USER_TOKEN || "";

// Axios instance for external API
const versesApi = axios.create({
  baseURL: url,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const abbrev = searchParams.get("abbrev");
  const chapter = searchParams.get("chapter");
  const verse = searchParams.get("verse");

  try {
    let endpoint = "";

    if (type === "random") {
      endpoint = "/verses/acf/random";
    } else if (abbrev && chapter && verse) {
      endpoint = `/verses/acf/${abbrev}/${chapter}/${verse}`;
    } else {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const response = await versesApi.get(endpoint);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const axiosError = error as AxiosError;
    console.error("Erro ao buscar versículo:", {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    const status = axiosError.response?.status || 500;
    const errorData = axiosError.response?.data || { error: axiosError.message || "Erro ao processar requisição" };

    return NextResponse.json(errorData, { status });
  }
}
