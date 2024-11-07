import { FormItemProps } from "antd";

export const requiredRules: FormItemProps["rules"] = [
  { required: true, message: "Este campo é obrigatório." },
];
