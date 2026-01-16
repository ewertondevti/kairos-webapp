import axios, { AxiosError, AxiosResponse } from "axios";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const baseURL = `https://us-central1-${projectId}.cloudfunctions.net`;

const api = axios.create({
  baseURL,
  timeout: 60000 * 5, // 5min
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses for debugging
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

export default api;
