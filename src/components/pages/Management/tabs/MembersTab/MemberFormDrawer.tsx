import { Button, Drawer, Form, Space } from "antd";
import type { FormInstance } from "antd/es/form";
import { ReactNode } from "react";

type MemberFormDrawerProps = {
  title: string;
  open: boolean;
  size: "default" | "large";
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitLoading?: boolean;
  form: FormInstance;
  initialValues?: Record<string, unknown>;
  children: ReactNode;
};

export const MemberFormDrawer = ({
  title,
  open,
  size,
  onClose,
  onSubmit,
  submitLabel,
  submitLoading,
  form,
  initialValues,
  children,
}: MemberFormDrawerProps) => {
  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size={size}
      extra={
        <Space className="drawer-actions" wrap>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" onClick={onSubmit} loading={submitLoading}>
            {submitLabel}
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {children}
      </Form>
    </Drawer>
  );
};
