import { DatePickerProps, FormItemProps } from "antd";
import dayjs from "dayjs";

export const dateFormat = "DD/MM/YYYY";

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

export const requiredRules: FormItemProps["rules"] = [
  { required: true, message: "Este campo é obrigatório." },
];

export const disabledDate: DatePickerProps["disabledDate"] = (current) => {
  return current && (current.year() < 1900 || current.isAfter(dayjs()));
};

export const postalCodeRegex = /\d{4}-\d{3}/g;
