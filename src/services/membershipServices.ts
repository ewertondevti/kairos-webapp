import { IPostalCode } from "@/types/membership";
import { MemberPayload } from "@/types/store";

export const getAddress = async (postalCode: string): Promise<IPostalCode[]> => {
  try {
    const response = await fetch(`/api/address?postalCode=${encodeURIComponent(postalCode)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar endereço");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error("Erro ao buscar endereço:", error);
    return [];
  }
};

export const createNewMember = async (payload: MemberPayload) => {
  const response = await fetch("/api/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar membro");
  }

  return response.json();
};
