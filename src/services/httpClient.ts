import axios, { AxiosError } from "axios";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const api = axios.create({
  baseURL: `https://us-central1-${projectId}.cloudfunctions.net`,
  timeout: 60000 * 5, // 5min
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
