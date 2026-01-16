import axios from "axios";
import { getAuthHeaders } from "./authHeaders";
import { UserProfile, UserRole } from "@/types/user";

export type RequestAccessPayload = {
  fullname: string;
  email: string;
};

export type CreateUserPayload = {
  fullname: string;
  email: string;
  role: UserRole;
};

export type UpdateUserPayload = Record<string, unknown>;

export const requestAccess = async (payload: RequestAccessPayload) => {
  const response = await axios.post("/api/access-request", payload);
  return response.data;
};

export const getUsers = async (): Promise<UserProfile[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get("/api/users", { headers });
  return Array.isArray(response.data) ? response.data : [];
};

export const createUser = async (payload: CreateUserPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.post("/api/users", payload, { headers });
  return response.data;
};

export const updateUserProfile = async (
  payload: UpdateUserPayload,
  uid?: string
) => {
  const headers = await getAuthHeaders();
  const response = await axios.patch(
    "/api/users",
    { payload, uid },
    { headers }
  );
  return response.data;
};

export const setUserActive = async (uid: string, active: boolean) => {
  const headers = await getAuthHeaders();
  const response = await axios.patch(
    "/api/users/active",
    { uid, active },
    { headers }
  );
  return response.data;
};

export const setUserRole = async (uid: string, role: UserRole) => {
  const headers = await getAuthHeaders();
  const response = await axios.patch(
    "/api/users/role",
    { uid, role },
    { headers }
  );
  return response.data;
};

export const getUserProfile = async (): Promise<{ user: UserProfile }> => {
  const headers = await getAuthHeaders();
  const response = await axios.get("/api/users/profile", { headers });
  return response.data;
};

export const syncUserClaims = async () => {
  if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
    console.warn("NEXT_PUBLIC_PROJECT_ID não configurado.");
    return null;
  }

  const headers = await getAuthHeaders();
  try {
    const response = await axios.post("/api/users/sync-claims", undefined, {
      headers,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn("Endpoint syncUserClaims indisponível.");
      return null;
    }
    throw error;
  }
};
