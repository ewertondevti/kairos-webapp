import { NextResponse } from "next/server";
import axios, { AxiosError, AxiosResponse } from "axios";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// Axios instance for server-side requests (same config as httpClient.ts)
const serverApi = axios.create({
  baseURL: `https://us-central1-${projectId}.cloudfunctions.net`,
  timeout: 60000 * 5, // 5min (same as httpClient.ts)
});

// Request interceptor (same as httpClient.ts)
serverApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor (same as httpClient.ts, but adapted for server-side)
serverApi.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses for debugging (same as httpClient.ts)
    if (response.config.url?.includes("getAlbums")) {
      console.log("getAlbums response:", {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
      });
    }
    return response;
  },
  (error: AxiosError) => {
    console.error("Erro na requisição:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export async function proxyRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  body?: any,
  params?: Record<string, string>,
  headers?: Record<string, string>
) {
  try {
    const config: any = {
      method,
      url: endpoint,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.data = body;
    }

    // Add params for GET and DELETE requests
    if (params && Object.keys(params).length > 0) {
      // Filter out empty values
      const validParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== "")
      );
      if (Object.keys(validParams).length > 0) {
        config.params = validParams;
      }
    }

    if (headers && Object.keys(headers).length > 0) {
      config.headers = headers;
    }

    const response = await serverApi.request(config);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const axiosError = error as AxiosError;
    console.error(`Erro ao fazer proxy para ${endpoint}:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    const status = axiosError.response?.status || 500;
    const errorData = axiosError.response?.data || { error: axiosError.message || "Erro ao processar requisição" };

    return NextResponse.json(errorData, { status });
  }
}
