import dayjs from "dayjs";
import { ChildFormValue } from "@/types/membership";
import { MemberChild } from "@/types/user";
import { MemberChildPayload } from "@/types/store";

type ChildInput = MemberChild | string;

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
