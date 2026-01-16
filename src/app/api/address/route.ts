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

  const appId = process.env.NEXT_PUBLIC_PTCP_APP_ID;

  if (!appId) {
    return NextResponse.json(
      { error: "App ID não configurado" },
      { status: 500 }
    );
  }

  try {
    const response = await axios.get(
      `https://api.duminio.com/ptcp/v2/${appId}/${postalCode.replace("-", "")}`,
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
