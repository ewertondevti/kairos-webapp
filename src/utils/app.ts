import { DatePickerProps, FormItemProps } from "antd";
import dayjs from "dayjs";

export const dateFormat = "DD/MM/YYYY";

export const requiredRules: FormItemProps["rules"] = [
  { required: true, message: "Este campo é obrigatório." },
];

export const disabledDate: DatePickerProps["disabledDate"] = (current) => {
  return current && (current.year() < 1900 || current.isAfter(dayjs()));
};

export const postalCodeRegex = /\d{4}-\d{3}/g;
