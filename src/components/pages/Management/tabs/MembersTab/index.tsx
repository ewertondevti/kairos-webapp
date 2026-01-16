"use client";

import { MembershipFields } from "@/enums/membership";
import { useGetUsers } from "@/react-query";
import {
  createUser,
  setUserActive,
  setUserRole,
  updateUserProfile,
} from "@/services/userServices";
import { useAuth } from "@/store";
import { UserProfile, UserRole } from "@/types/user";
import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  InputRef,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QueryNames } from "@/react-query/queryNames";
import { EcclesiasticalInfo } from "@/components/pages/MembershipForm/EcclesiasticalInfo";
import { ParentInfo } from "@/components/pages/MembershipForm/ParentInfo";
import { PersonalInfo } from "@/components/pages/MembershipForm/PersonalInfo";
import { SearchOutlined } from "@ant-design/icons";
import { churchRoleOptions } from "@/constants/churchRoles";
import type { FilterDropdownProps } from "antd/es/table/interface";

type CreateFormValues = {
  fullname: string;
  email: string;
  role: UserRole;
};

const roleOptions = [
  { label: "Admin", value: UserRole.Admin },
  { label: "Secretaria", value: UserRole.Secretaria },
  { label: "Mídia", value: UserRole.Midia },
];

const getRoleLabel = (role?: UserRole) =>
  roleOptions.find((option) => option.value === role)?.label ?? "Sem perfil";

type MembersTabProps = {
  mode?: "admin" | "secretaria";
};

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

export const MembersTab = ({ mode = "admin" }: MembersTabProps) => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canViewUsers =
    (mode === "admin" && role === UserRole.Admin) ||
    (mode === "secretaria" &&
      (role === UserRole.Admin || role === UserRole.Secretaria));
  const { data: users = [], isLoading } = useGetUsers(canViewUsers);

  const isAdminView = mode === "admin";
  const canCreateUsers = isAdminView && role === UserRole.Admin;
  const canToggleActive = isAdminView && role === UserRole.Admin;
  const canEditMembers = canViewUsers;
  const canUpdateRole = isAdminView && role === UserRole.Admin;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [createForm] = Form.useForm<CreateFormValues>();
  const [editForm] = Form.useForm();
  const searchInput = useRef<InputRef>(null);

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

  const onUpdateRole = async (user: UserProfile, nextRole: UserRole) => {
    try {
      await setUserRole(user.authUid || user.id, nextRole);
      message.success("Perfil atualizado com sucesso!");
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar o perfil.");
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
        [MembershipFields.BirthDate]:
          values?.[MembershipFields.BirthDate]?.toISOString(),
        [MembershipFields.WeddingDate]:
          values?.[MembershipFields.WeddingDate]?.toISOString(),
        [MembershipFields.BaptismDate]:
          values?.[MembershipFields.BaptismDate]?.toISOString(),
        [MembershipFields.AdmissionDate]:
          values?.[MembershipFields.AdmissionDate]?.toISOString(),
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

  const getColumnSearchProps = (dataIndex: keyof UserProfile) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder="Buscar..."
          value={selectedKeys[0] ? String(selectedKeys[0]) : ""}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
          >
            Filtrar
          </Button>
          <Button
            onClick={() => {
              clearFilters?.();
              confirm();
            }}
            size="small"
          >
            Limpar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value: string, record: UserProfile) =>
      String(record[dataIndex] ?? "")
        .toLowerCase()
        .includes(String(value).toLowerCase()),
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: "Nome",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a: UserProfile, b: UserProfile) =>
        a.fullname.localeCompare(b.fullname),
      ...getColumnSearchProps("fullname"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a: UserProfile, b: UserProfile) =>
        a.email.localeCompare(b.email),
      ...getColumnSearchProps("email"),
    },
    ...(isAdminView
      ? [
          {
            title: "Perfil",
            dataIndex: "role",
            key: "role",
            filters: roleOptions.map((option) => ({
              text: option.label,
              value: option.value,
            })),
            onFilter: (value: UserRole, record: UserProfile) =>
              record.role === value,
            sorter: (a: UserProfile, b: UserProfile) =>
              getRoleLabel(a.role).localeCompare(getRoleLabel(b.role)),
            render: (value: UserRole, record: UserProfile) =>
              canUpdateRole ? (
                <Select
                  value={value}
                  options={roleOptions}
                  onChange={(nextRole) =>
                    onUpdateRole(record, nextRole as UserRole)
                  }
                  style={{ minWidth: 140 }}
                />
              ) : (
                <Tag
                  color={
                    value === UserRole.Admin
                      ? "blue"
                      : value === UserRole.Midia
                      ? "purple"
                      : "gold"
                  }
                >
                  {getRoleLabel(value)}
                </Tag>
              ),
          },
          {
            title: "Status",
            dataIndex: "active",
            key: "active",
            filters: [
              { text: "Ativo", value: true },
              { text: "Inativo", value: false },
            ],
            onFilter: (value: boolean, record: UserProfile) =>
              record.active === value,
            sorter: (a: UserProfile, b: UserProfile) =>
              Number(a.active) - Number(b.active),
            render: (value: boolean) =>
              value ? (
                <Tag color="green">Ativo</Tag>
              ) : (
                <Tag color="red">Inativo</Tag>
              ),
          },
        ]
      : []),
    {
      title: "Ações",
      key: "actions",
      render: (_: unknown, record: UserProfile) => (
        <Space>
          <Button onClick={() => openEdit(record)} disabled={!canEditMembers}>
            Editar
          </Button>
          {canToggleActive && (
            <Button
              type={record.active ? "default" : "primary"}
              danger={record.active}
              onClick={() => onToggleActive(record)}
            >
              {record.active ? "Desativar" : "Ativar"}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!canViewUsers) {
    return <Empty description="Sem permissão para visualizar esta área." />;
  }

  return (
    <>
      {canCreateUsers && (
        <Space className="mb-4">
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            Criar usuário
          </Button>
        </Space>
      )}

      <Table
        rowKey={(record) => record.id}
        loading={isLoading}
        dataSource={users}
        columns={columns}
        scroll={{ x: "max-content" }}
      />

      {canCreateUsers && (
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
      )}

      <Drawer
        title={`Editar dados do ${isAdminView ? "usuario" : "membro"}`}
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
          <EcclesiasticalInfo churchRoleOptions={churchRoleOptions} />
        </Form>
      </Drawer>
    </>
  );
};

export default MembersTab;
