"use client";

import { MembershipFields } from "@/enums/membership";
import { useGetUsers } from "@/react-query";
import {
  createUser,
  setUserActive,
  updateUserProfile,
} from "@/services/userServices";
import { useAuth } from "@/store";
import { UserProfile, UserRole } from "@/types/user";
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
  Empty,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QueryNames } from "@/react-query/queryNames";
import { EcclesiasticalInfo } from "@/components/pages/MembershipForm/EcclesiasticalInfo";
import { ParentInfo } from "@/components/pages/MembershipForm/ParentInfo";
import { PersonalInfo } from "@/components/pages/MembershipForm/PersonalInfo";

type CreateFormValues = {
  fullname: string;
  email: string;
  role: UserRole;
};

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Secretaria", value: "secretaria" },
  { label: "Mídia", value: "midia" },
];

const mapMemberToForm = (user: UserProfile) => {
  const member = user.member;
  return {
    [MembershipFields.Fullname]: member?.fullname ?? user.fullname,
    [MembershipFields.Email]: member?.email ?? user.email,
    [MembershipFields.BirthDate]: member?.birthDate
      ? dayjs(member.birthDate)
      : undefined,
    [MembershipFields.Gender]: member?.gender,
    [MembershipFields.MaritalStatus]: member?.maritalStatus,
    [MembershipFields.PostalCode]: member?.postalCode,
    [MembershipFields.Address]: member?.address,
    [MembershipFields.City]: member?.city,
    [MembershipFields.County]: member?.county,
    [MembershipFields.State]: member?.state,
    [MembershipFields.MotherName]: member?.motherName,
    [MembershipFields.FatherName]: member?.fatherName,
    [MembershipFields.SpouseName]: member?.spouseName,
    [MembershipFields.WeddingDate]: member?.weddingDate
      ? dayjs(member.weddingDate)
      : undefined,
    [MembershipFields.Children]: member?.children ?? [],
    [MembershipFields.BaptismChurch]: member?.baptismChurch,
    [MembershipFields.BaptismDate]: member?.baptismDate
      ? dayjs(member.baptismDate)
      : undefined,
    [MembershipFields.AdmissionType]: member?.admissionType,
    [MembershipFields.BaptizedPastor]: member?.baptizedPastor,
    [MembershipFields.AdmissionDate]: member?.admissionDate
      ? dayjs(member.admissionDate)
      : undefined,
    [MembershipFields.Congregation]: member?.congregation,
    [MembershipFields.ChurchRole]: member?.churchRole,
    [MembershipFields.BelongsTo]: member?.belongsTo,
    [MembershipFields.Photo]: member?.photo,
  };
};

export const MembersTab = () => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const { data: users = [], isLoading } = useGetUsers(
    role === "admin" || role === "secretaria"
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [createForm] = Form.useForm<CreateFormValues>();
  const [editForm] = Form.useForm();

  const canManageUsers = role === "admin" || role === "secretaria";
  const canCreateUsers = role === "admin";

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [QueryNames.GetUsers] });

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    editForm.setFieldsValue(mapMemberToForm(user));
    setEditOpen(true);
  };

  const onToggleActive = async (user: UserProfile) => {
    try {
      await setUserActive(user.authUid || user.id, !user.active);
      message.success("Status atualizado com sucesso!");
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar o status.");
    }
  };

  const onCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      await createUser(values);
      message.success("Usuário criado com sucesso!");
      createForm.resetFields();
      setCreateOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível criar o usuário.");
    }
  };

  const onUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const values = await editForm.validateFields();
      const photoValue = values?.[MembershipFields.Photo];
      const safePhoto = typeof photoValue === "string" ? photoValue : undefined;
      const payload = {
        ...values,
        [MembershipFields.BirthDate]: values?.[MembershipFields.BirthDate]?.toISOString(),
        [MembershipFields.WeddingDate]: values?.[MembershipFields.WeddingDate]?.toISOString(),
        [MembershipFields.BaptismDate]: values?.[MembershipFields.BaptismDate]?.toISOString(),
        [MembershipFields.AdmissionDate]: values?.[MembershipFields.AdmissionDate]?.toISOString(),
        [MembershipFields.Photo]: safePhoto,
      };

      await updateUserProfile(payload, editingUser.authUid || editingUser.id);
      message.success("Dados atualizados com sucesso!");
      setEditOpen(false);
      setEditingUser(null);
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar os dados.");
    }
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Perfil",
      dataIndex: "role",
      key: "role",
      render: (value: UserRole) => (
        <Tag color={value === "admin" ? "blue" : value === "midia" ? "purple" : "gold"}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (value: boolean) =>
        value ? <Tag color="green">Ativo</Tag> : <Tag color="red">Inativo</Tag>,
    },
    {
      title: "Ações",
      key: "actions",
      render: (_: unknown, record: UserProfile) => (
        <Space>
          <Button onClick={() => openEdit(record)} disabled={!canManageUsers}>
            Editar
          </Button>
          <Button
            type={record.active ? "default" : "primary"}
            danger={record.active}
            onClick={() => onToggleActive(record)}
            disabled={!canManageUsers}
          >
            {record.active ? "Desativar" : "Ativar"}
          </Button>
        </Space>
      ),
    },
  ];

  if (!canManageUsers) {
    return <Empty description="Sem permissão para visualizar esta área." />;
  }

  return (
    <>
      <Space className="mb-4">
        <Button type="primary" onClick={() => setCreateOpen(true)} disabled={!canCreateUsers}>
          Criar usuário
        </Button>
      </Space>

      <Table
        rowKey={(record) => record.id}
        loading={isLoading}
        dataSource={users}
        columns={columns}
      />

      <Modal
        title="Criar usuário"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={onCreateUser}
        okText="Criar"
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="fullname"
            label="Nome completo"
            rules={[{ required: true, message: "Informe o nome." }]}
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
        </Form>
      </Modal>

      <Drawer
        title="Editar dados do usuário"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        width={720}
        extra={
          <Space>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button type="primary" onClick={onUpdateUser}>
              Salvar
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={{ [MembershipFields.Children]: [] }}>
          <PersonalInfo />
          <ParentInfo />
          <EcclesiasticalInfo />
        </Form>
      </Drawer>
    </>
  );
};

export default MembersTab;
