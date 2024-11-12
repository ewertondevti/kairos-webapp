import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: "https://www.abibliadigital.com.br/api",
  timeout: 20000, // 20s
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (config.withCredentials) {
      config.withCredentials = false;
      config.headers.Authorization = `Bearer ${
        import.meta.env.VITE_DEFAULT_USER_TOKEN
      }`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
