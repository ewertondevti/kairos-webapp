import axios, { AxiosError } from "axios";

const projectId = import.meta.env.VITE_PROJECT_ID;

const api = axios.create({
  baseURL: `https://us-central1-${projectId}.cloudfunctions.net`,
  timeout: 20000, // 20s
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
