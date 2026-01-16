import dayjs from "dayjs";
import { ChildFormValue, ChildInput } from "@/types/membership";
import { MemberChildPayload } from "@/types/store";

export const normalizeMemberChildren = (
  children?: ChildInput[]
): ChildFormValue[] => {
  if (!Array.isArray(children)) return [];

  return children.map((child) => {
    if (typeof child === "string") {
      return { name: child };
    }

    return {
      name: child.name,
      birthDate: child.birthDate ? dayjs(child.birthDate) : undefined,
    };
  });
};

export const mapChildrenToPayload = (
  children?: ChildFormValue[]
): MemberChildPayload[] => {
  if (!Array.isArray(children)) return [];

  return children
    .filter((child) => Boolean(child?.name?.trim()))
    .map((child) => ({
      name: child.name.trim(),
      birthDate: child.birthDate ? child.birthDate.toISOString() : undefined,
    }));
};
