import { CreateFormValues } from "@/components/pages/Management/tabs/MembersTab/types";
import { UserRole } from "@/features/auth/auth.enums";
import { formatPersonName, personNameRules } from "@/utils/app";
import { Alert, Form, Input, Modal, Select } from "antd";
import type { FormInstance } from "antd/es/form";

type RoleOption = {
  label: string;
  value: UserRole;
};

type CreateUserModalProps = {
  open: boolean;
  isMobile: boolean;
  form: FormInstance<CreateFormValues>;
  roleOptions: RoleOption[];
  onCancel: () => void;
  onOk: () => void;
};

export const CreateUserModal = ({
  open,
  isMobile,
  form,
  roleOptions,
  onCancel,
  onOk,
}: CreateUserModalProps) => {
  return (
    <Modal
      title="Criar usuário"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="Criar"
      destroyOnHidden
      width={isMobile ? "100%" : 520}
      style={isMobile ? { top: 12 } : undefined}
      styles={{
        body: isMobile
          ? { maxHeight: "calc(100vh - 160px)", overflowY: "auto" }
          : undefined,
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="fullname"
          label="Nome completo"
          rules={[
            { required: true, message: "Informe o nome." },
            ...personNameRules,
          ]}
          getValueFromEvent={(event) =>
            formatPersonName(event?.target?.value ?? "")
          }
        >
          <Input placeholder="Nome completo" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Informe o email." },
            { type: "email", message: "Email inválido." },
          ]}
        >
          <Input placeholder="email@dominio.com" type="email" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Perfil"
          rules={[{ required: true, message: "Selecione o perfil." }]}
        >
          <Select options={roleOptions} placeholder="Selecione o perfil" />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          style={{ marginTop: 12 }}
          title="A senha do usuário será gerada automaticamente."
        />
      </Form>
    </Modal>
  );
};
