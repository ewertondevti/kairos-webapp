import axios from "axios";
import { getAuthHeaders } from "./authHeaders";
import { UserRole } from "@/features/auth/auth.enums";
import { UserProfile } from "@/types/user";
import { MembershipSubmissionPayload } from "@/types/membership";

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

export type AccessRequestStatus = "pending" | "approved" | "rejected";

export type AccessRequest = {
  id: string;
  fullname: string;
  email: string;
  status: AccessRequestStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

export const requestAccess = async (payload: RequestAccessPayload) => {
  const response = await axios.post("/api/access-request", payload);
  return response.data;
};

export const getUsers = async (): Promise<UserProfile[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get("/api/users", { headers });
  return Array.isArray(response.data) ? response.data : [];
};

export const getAccessRequests = async (): Promise<AccessRequest[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get("/api/access-requests", { headers });
  return Array.isArray(response.data) ? response.data : [];
};

export const updateAccessRequestStatus = async (
  id: string,
  status: AccessRequestStatus
) => {
  const headers = await getAuthHeaders();
  const response = await axios.patch(
    "/api/access-requests",
    { id, status },
    { headers }
  );
  return response.data;
};

export const deleteAccessRequest = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete("/api/access-requests", {
    headers,
    data: { id },
  });
  return response.data;
};

export const createUser = async (payload: CreateUserPayload) => {
  const headers = await getAuthHeaders();
  const response = await axios.post("/api/users", payload, { headers });
  return response.data;
};

export const submitMembershipForm = async (
  payload: MembershipSubmissionPayload
) => {
  const response = await axios.post("/api/membership", { payload });
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

export const syncUserClaims = async (token?: string) => {
  if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
    console.warn("NEXT_PUBLIC_PROJECT_ID não configurado.");
    return null;
  }

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : await getAuthHeaders();
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
