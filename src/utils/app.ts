import type { DatePickerProps, FormItemProps } from "antd";
import dayjs from "dayjs";

export const dateFormat = "DD/MM/YYYY";
export const dateInputFormat: NonNullable<DatePickerProps["format"]> = {
  format: dateFormat,
  type: "mask",
};

export const SCREEN_VALUES = {
  "mobile-portrait": {
    width: 178,
    height: 237,
    columns: 2,
  },
  "mobile-landscape": {
    width: 174,
    height: 231,
    columns: 2,
  },
  "tablet-portrait": {
    width: 186,
    height: 249,
    columns: 4,
  },
  "tablet-landscape": {
    width: 220,
    height: 294,
    columns: 4,
  },
  desktop: {
    width: 237,
    height: 315,
    columns: 6,
  },
};

export const LIST_ITEM_VALUES = {
  "mobile-portrait": {
    width: "100%",
    height: 200,
  },
  "mobile-landscape": {
    width: "100%",
    height: 300,
  },
  "tablet-portrait": {
    width: "100%",
    height: 400,
  },
  "tablet-landscape": {
    width: "100%",
    height: 500,
  },
  desktop: {
    width: "100%",
    height: 500,
  },
};

export const requiredRules: NonNullable<FormItemProps["rules"]> = [
  { required: true, message: "Este campo é obrigatório." },
];

export const disabledDate: DatePickerProps["disabledDate"] = (current) => {
  return current && (current.year() < 1900 || current.isAfter(dayjs()));
};

export const postalCodeRegex = /^\d{4}-\d{3}$/;

export const formatPostalCode = (value?: string) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, "").slice(0, 7);
  if (digits.length <= 4) {
    return digits;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};
