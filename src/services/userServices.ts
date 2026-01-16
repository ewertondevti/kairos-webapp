import axios from "axios";
import { getAuthHeaders } from "./authHeaders";
import { MemberProfile, UserProfile, UserRole } from "@/types/user";

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

export const getUserProfile = async (): Promise<{
  user: UserProfile;
  member: MemberProfile | null;
}> => {
  const headers = await getAuthHeaders();
  const response = await axios.get("/api/users/profile", { headers });
  return response.data;
};
