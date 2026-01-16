import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postalCode = searchParams.get("postalCode");

  if (!postalCode) {
    return NextResponse.json(
      { error: "Código postal é obrigatório" },
      { status: 400 }
    );
  }

  const normalizedPostalCode = postalCode.replace(/\D/g, "");

  if (normalizedPostalCode.length !== 7) {
    return NextResponse.json(
      { error: "Código postal inválido" },
      { status: 400 }
    );
  }

  const formattedPostalCode = `${normalizedPostalCode.slice(
    0,
    4
  )}-${normalizedPostalCode.slice(4)}`;

  const apiKey = process.env.NEXT_PUBLIC_CTT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key não configurada" },
      { status: 500 }
    );
  }

  try {
    const response = await axios.get(
      `https://www.cttcodigopostal.pt/api/v1/${apiKey}/${formattedPostalCode}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const axiosError = error as AxiosError;
    console.error("Erro ao buscar endereço:", {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    const status = axiosError.response?.status || 500;
    const errorData = axiosError.response?.data || { error: axiosError.message || "Erro ao processar requisição" };

    return NextResponse.json(errorData, { status });
  }
}
