import { DatePickerProps, FormItemProps } from "antd";
import dayjs from "dayjs";

export const dateFormat = "DD/MM/YYYY";

export const SCREEN_VALUES = {
  "mobile-portrait": {
    width: 178,
    height: 237,
  },
  "mobile-landscape": {
    width: 174,
    height: 231,
  },
  "tablet-portrait": {
    width: 186,
    height: 249,
  },
  "tablet-landscape": {
    width: 220,
    height: 294,
  },
  desktop: {
    width: 237,
    height: 315,
  },
};

export const requiredRules: FormItemProps["rules"] = [
  { required: true, message: "Este campo é obrigatório." },
];

export const disabledDate: DatePickerProps["disabledDate"] = (current) => {
  return current && (current.year() < 1900 || current.isAfter(dayjs()));
};

export const postalCodeRegex = /\d{4}-\d{3}/g;
