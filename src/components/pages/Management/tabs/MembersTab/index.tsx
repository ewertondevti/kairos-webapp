"use client";

import { CreateFormValues } from "@/components/pages/Management/tabs/MembersTab/types";
import { EcclesiasticalInfo } from "@/components/pages/MembershipForm/EcclesiasticalInfo";
import { ParentInfo } from "@/components/pages/MembershipForm/ParentInfo";
import { PersonalInfo } from "@/components/pages/MembershipForm/PersonalInfo";
import { churchRoleOptions } from "@/constants/churchRoles";
import { MembershipFields } from "@/enums/membership";
import { useGetAccessRequests, useGetUsers } from "@/react-query";
import { QueryNames } from "@/react-query/queryNames";
import { logAuditEvent } from "@/services/auditService";
import {
  AccessRequest,
  createUser,
  setUserActive,
  setUserRole,
  updateAccessRequestStatus,
  updateUserProfile,
} from "@/services/userServices";
import { useAuth } from "@/store";
import { UserProfile, UserRole } from "@/types/user";
import {
  mapChildrenToPayload,
  normalizeMemberChildren,
} from "@/utils/membership";
import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  InputRef,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type {
  ColumnsType,
  ColumnType,
  FilterDropdownProps,
} from "antd/es/table/interface";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useRef, useState, type Key } from "react";

const roleOptions = [
  { label: "Admin", value: UserRole.Admin },
  { label: "Secretaria", value: UserRole.Secretaria },
  { label: "Mídia", value: UserRole.Midia },
];

const getRoleLabel = (role?: UserRole) =>
  roleOptions.find((option) => option.value === role)?.label ?? "Sem perfil";

const getChurchRoleLabel = (role?: string) =>
  churchRoleOptions.find((option) => option.value === role)?.label ??
  "Sem cargo";

type MembersTabProps = {
  mode?: "admin" | "secretaria";
};

const mapUserToForm = (user: UserProfile) => ({
  [MembershipFields.Fullname]: user.fullname,
  [MembershipFields.Email]: user.email,
  [MembershipFields.BirthDate]: user.birthDate
    ? dayjs(user.birthDate)
    : undefined,
  [MembershipFields.Gender]: user.gender,
  [MembershipFields.MaritalStatus]: user.maritalStatus,
  [MembershipFields.PostalCode]: user.postalCode,
  [MembershipFields.Address]: user.address,
  [MembershipFields.AddressNumber]: user.addressNumber,
  [MembershipFields.AddressFloor]: user.addressFloor,
  [MembershipFields.AddressDoor]: user.addressDoor,
  [MembershipFields.City]: user.city,
  [MembershipFields.County]: user.county,
  [MembershipFields.State]: user.state,
  [MembershipFields.MotherName]: user.motherName,
  [MembershipFields.FatherName]: user.fatherName,
  [MembershipFields.SpouseName]: user.spouseName,
  [MembershipFields.WeddingDate]: user.weddingDate
    ? dayjs(user.weddingDate)
    : undefined,
  [MembershipFields.Children]: normalizeMemberChildren(user.children),
  [MembershipFields.BaptismChurch]: user.baptismChurch,
  [MembershipFields.BaptismDate]: user.baptismDate
    ? dayjs(user.baptismDate)
    : undefined,
  [MembershipFields.AdmissionType]: user.admissionType,
  [MembershipFields.BaptizedPastor]: user.baptizedPastor,
  [MembershipFields.AdmissionDate]: user.admissionDate
    ? dayjs(user.admissionDate)
    : undefined,
  [MembershipFields.Congregation]: user.congregation,
  [MembershipFields.ChurchRole]: user.churchRole,
  [MembershipFields.BelongsTo]: user.belongsTo,
  [MembershipFields.Photo]: user.photo,
});

export const MembersTab = ({ mode = "admin" }: MembersTabProps) => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const canViewUsers =
    (mode === "admin" && role === UserRole.Admin) ||
    (mode === "secretaria" &&
      (role === UserRole.Admin || role === UserRole.Secretaria));
  const { data: users = [], isLoading } = useGetUsers(canViewUsers);
  const { data: accessRequests = [] } = useGetAccessRequests(
    mode === "admin" && role === UserRole.Admin
  );

  const isAdminView = mode === "admin";
  const canCreateUsers = isAdminView && role === UserRole.Admin;
  const canCreateMembers = mode === "secretaria" && canViewUsers;
  const canToggleActive =
    role === UserRole.Admin ||
    (mode === "secretaria" && role === UserRole.Secretaria);
  const canEditMembers = canViewUsers;
  const canUpdateProfileRole = isAdminView && role === UserRole.Admin;
  const canUpdateChurchRole = canEditMembers;

  const [createOpen, setCreateOpen] = useState(false);
  const [createMemberOpen, setCreateMemberOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedAccessRequest, setSelectedAccessRequest] =
    useState<AccessRequest | null>(null);
  const [createForm] = Form.useForm<CreateFormValues>();
  const [createMemberForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [creatingMember, setCreatingMember] = useState(false);
  const searchInput = useRef<InputRef>(null);
  const { modal } = App.useApp();

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [QueryNames.GetUsers] });
  const refreshAccessRequests = () =>
    queryClient.invalidateQueries({ queryKey: [QueryNames.GetAccessRequests] });

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    editForm.setFieldsValue(mapUserToForm(user));
    setEditOpen(true);
  };

  const onToggleActive = async (user: UserProfile) => {
    try {
      await setUserActive(user.authUid || user.id, !user.active);
      message.success("Status atualizado com sucesso!");
      void logAuditEvent({
        action: "user.active.update",
        targetType: "user",
        targetId: user.authUid || user.id,
        metadata: { active: !user.active },
      });
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar o status.");
    }
  };

  const confirmDeactivateUser = (user: UserProfile) => {
    const displayName =
      user.fullname?.trim() || user.email?.trim() || "este usuário";
    modal.confirm({
      title: "Desativar usuário",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Tem certeza que deseja desativar <strong>{displayName}</strong>? Ele
          não poderá acessar o sistema.
        </span>
      ),
      okText: "Desativar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () => onToggleActive(user),
    });
  };

  const onUpdateRole = async (user: UserProfile, nextRole: UserRole) => {
    try {
      await setUserRole(user.authUid || user.id, nextRole);
      message.success("Perfil atualizado com sucesso!");
      void logAuditEvent({
        action: "user.role.update",
        targetType: "user",
        targetId: user.authUid || user.id,
        metadata: { role: nextRole },
      });
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar o perfil.");
    }
  };

  const onUpdateChurchRole = async (user: UserProfile, nextRole?: string) => {
    try {
      await updateUserProfile(
        { [MembershipFields.ChurchRole]: nextRole ?? null },
        user.authUid || user.id
      );
      message.success("Cargo atualizado com sucesso!");
      void logAuditEvent({
        action: "member.churchRole.update",
        targetType: "user",
        targetId: user.authUid || user.id,
        metadata: { churchRole: nextRole ?? null },
      });
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar o cargo.");
    }
  };

  const onCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      await createUser(values);
      message.success("Usuário criado com sucesso!");
      void logAuditEvent({
        action: "user.create",
        targetType: "user",
        metadata: {
          email: values.email,
          fullname: values.fullname,
          role: values.role,
        },
      });
      if (selectedAccessRequest) {
        await updateAccessRequestStatus(selectedAccessRequest.id, "approved");
        void logAuditEvent({
          action: "accessRequest.approve",
          targetType: "accessRequest",
          targetId: selectedAccessRequest.id,
          metadata: {
            email: selectedAccessRequest.email,
            fullname: selectedAccessRequest.fullname,
          },
        });
        refreshAccessRequests();
      }
      createForm.resetFields();
      setCreateOpen(false);
      setSelectedAccessRequest(null);
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível criar o usuário.");
    }
  };

  const openCreateUser = () => {
    setSelectedAccessRequest(null);
    createForm.resetFields();
    setCreateOpen(true);
  };

  const openCreateFromRequest = (request: AccessRequest) => {
    setSelectedAccessRequest(request);
    createForm.setFieldsValue({
      fullname: request.fullname,
      email: request.email,
    });
    setCreateOpen(true);
  };

  const onUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const values = await editForm.validateFields();
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
        [MembershipFields.Children]: mapChildrenToPayload(
          values?.[MembershipFields.Children]
        ),
      };

      await updateUserProfile(payload, editingUser.authUid || editingUser.id);
      message.success("Dados atualizados com sucesso!");
      void logAuditEvent({
        action: "member.update",
        targetType: "user",
        targetId: editingUser.authUid || editingUser.id,
        metadata: { fields: Object.keys(values) },
      });
      setEditOpen(false);
      setEditingUser(null);
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar os dados.");
    }
  };

  const onCreateMember = async () => {
    try {
      const values = await createMemberForm.validateFields();
      setCreatingMember(true);

      const createPayload = {
        fullname: values?.[MembershipFields.Fullname],
        email: values?.[MembershipFields.Email],
        role: UserRole.Midia,
      };

      const createdUser = await createUser(createPayload);
      const createdUid =
        createdUser?.authUid ?? createdUser?.id ?? createdUser?.uid ?? null;

      const profilePayload = {
        ...values,
        [MembershipFields.BirthDate]:
          values?.[MembershipFields.BirthDate]?.toISOString(),
        [MembershipFields.WeddingDate]:
          values?.[MembershipFields.WeddingDate]?.toISOString(),
        [MembershipFields.BaptismDate]:
          values?.[MembershipFields.BaptismDate]?.toISOString(),
        [MembershipFields.AdmissionDate]:
          values?.[MembershipFields.AdmissionDate]?.toISOString(),
        [MembershipFields.Children]: mapChildrenToPayload(
          values?.[MembershipFields.Children]
        ),
      };

      if (createdUid) {
        await updateUserProfile(profilePayload, createdUid);
        message.success("Membro criado com sucesso!");
        void logAuditEvent({
          action: "member.create",
          targetType: "user",
          targetId: createdUid,
          metadata: { fields: Object.keys(values) },
        });
      } else {
        message.warning(
          "Usuário criado, mas não foi possível preencher a ficha."
        );
      }

      createMemberForm.resetFields();
      setCreateMemberOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível criar o membro.");
    } finally {
      setCreatingMember(false);
    }
  };

  const getColumnSearchProps = (
    dataIndex: keyof UserProfile
  ): ColumnType<UserProfile> => ({
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
    onFilter: (value: Key | boolean, record: UserProfile) =>
      String(record[dataIndex] ?? "")
        .toLowerCase()
        .includes(String(value).toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (open: boolean) => {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const roleColumn: ColumnsType<UserProfile>[number] = {
    title: "Perfil",
    dataIndex: "role",
    key: "role",
    filters: roleOptions.map((option) => ({
      text: option.label,
      value: option.value,
    })),
    onFilter: (value: Key | boolean, record: UserProfile) =>
      typeof value === "boolean" ? false : record.role === Number(value),
    sorter: (a: UserProfile, b: UserProfile) =>
      getRoleLabel(a.role).localeCompare(getRoleLabel(b.role)),
    render: (value: UserRole, record: UserProfile) =>
      canUpdateProfileRole ? (
        <Select
          value={value}
          options={roleOptions}
          onChange={(nextRole) => onUpdateRole(record, nextRole as UserRole)}
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
  };

  const churchRoleColumn: ColumnsType<UserProfile>[number] = {
    title: "Cargo",
    dataIndex: "churchRole",
    key: "churchRole",
    filters: churchRoleOptions.map((option) => ({
      text: option.label,
      value: option.value,
    })),
    onFilter: (value: Key | boolean, record: UserProfile) =>
      typeof value === "boolean"
        ? false
        : String(record.churchRole ?? "") === String(value),
    sorter: (a: UserProfile, b: UserProfile) =>
      getChurchRoleLabel(a.churchRole).localeCompare(
        getChurchRoleLabel(b.churchRole)
      ),
    render: (value: string | undefined, record: UserProfile) =>
      canUpdateChurchRole ? (
        <Select
          value={value}
          options={churchRoleOptions}
          onChange={(nextRole) => onUpdateChurchRole(record, nextRole)}
          style={{ minWidth: 180 }}
          allowClear
          placeholder="Selecione o cargo"
        />
      ) : (
        <Tag color="gold">{getChurchRoleLabel(value)}</Tag>
      ),
  };

  const activeColumn: ColumnsType<UserProfile>[number] = {
    title: "Ativo",
    dataIndex: "active",
    key: "active",
    filters: [
      { text: "Ativo", value: true },
      { text: "Inativo", value: false },
    ],
    onFilter: (value: Key | boolean, record: UserProfile) => {
      const normalizedValue =
        typeof value === "boolean" ? value : value === "true" || value === "1";
      return record.active === normalizedValue;
    },
    sorter: (a: UserProfile, b: UserProfile) =>
      Number(a.active) - Number(b.active),
    render: (value: boolean) =>
      value ? <Tag color="green">Ativo</Tag> : <Tag color="red">Inativo</Tag>,
  };

  const columns: ColumnsType<UserProfile> = [
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
      ? [roleColumn, activeColumn]
      : [churchRoleColumn, activeColumn]),
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
              onClick={() =>
                record.active
                  ? confirmDeactivateUser(record)
                  : onToggleActive(record)
              }
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

  const tableUsers = users.filter(
    (user) =>
      Boolean(user?.authUid || user?.id) &&
      Boolean(user?.fullname?.trim() || user?.email?.trim())
  );

  const pendingAccessRequests = accessRequests.filter(
    (request) => request.status === "pending"
  );

  const accessRequestColumns: ColumnsType<AccessRequest> = [
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
      title: "Solicitado em",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value?: string | null) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Ações",
      key: "actions",
      render: (_: unknown, record: AccessRequest) => (
        <Button type="primary" onClick={() => openCreateFromRequest(record)}>
          Criar usuário
        </Button>
      ),
    },
  ];

  return (
    <>
      {isAdminView && (
        <>
          <Title level={4}>Solicitações de acesso</Title>
          <Table
            style={{ marginBottom: 24 }}
            rowKey={(record) => record.id}
            dataSource={pendingAccessRequests}
            columns={accessRequestColumns}
            locale={{
              emptyText: "Nenhuma solicitação pendente.",
            }}
            scroll={{ x: "max-content" }}
            size={isMobile ? "small" : "middle"}
          />
        </>
      )}

      {(canCreateUsers || canCreateMembers) && (
        <Space className="mb-4">
          {canCreateMembers && (
            <Button type="primary" onClick={() => setCreateMemberOpen(true)}>
              Nova ficha
            </Button>
          )}
          {canCreateUsers && (
            <Button type="primary" onClick={openCreateUser}>
              Criar usuário
            </Button>
          )}
        </Space>
      )}

      <Table
        style={{ marginTop: 16 }}
        childrenColumnName="__children"
        rowKey={(record) => record.authUid ?? record.id}
        loading={isLoading}
        dataSource={tableUsers}
        columns={columns}
        scroll={{ x: "max-content" }}
        size={isMobile ? "small" : "middle"}
      />

      {canCreateUsers && (
        <Modal
          title="Criar usuário"
          open={createOpen}
          onCancel={() => {
            setCreateOpen(false);
            setSelectedAccessRequest(null);
          }}
          onOk={onCreateUser}
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
            <div style={{ marginTop: 8, color: "#667085", fontSize: 12 }}>
              A senha do usuário será gerada automaticamente.
            </div>
          </Form>
        </Modal>
      )}

      {canCreateMembers && (
        <Drawer
          title="Nova ficha de membro"
          open={createMemberOpen}
          onClose={() => setCreateMemberOpen(false)}
          size={isMobile ? "large" : "default"}
          extra={
            <Space className="drawer-actions" wrap>
              <Button onClick={() => setCreateMemberOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="primary"
                onClick={onCreateMember}
                loading={creatingMember}
              >
                Salvar
              </Button>
            </Space>
          }
          destroyOnHidden
        >
          <Form
            form={createMemberForm}
            layout="vertical"
            initialValues={{
              [MembershipFields.Children]: normalizeMemberChildren([]),
            }}
          >
            <PersonalInfo />
            <ParentInfo />
            <EcclesiasticalInfo churchRoleOptions={churchRoleOptions} />
          </Form>
        </Drawer>
      )}

      <Drawer
        title={`Editar dados do ${isAdminView ? "usuario" : "membro"}`}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        size={isMobile ? "large" : "default"}
        extra={
          <Space className="drawer-actions" wrap>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button type="primary" onClick={onUpdateUser}>
              Salvar
            </Button>
          </Space>
        }
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{ [MembershipFields.Children]: [] }}
        >
          <PersonalInfo />
          <ParentInfo />
          <EcclesiasticalInfo churchRoleOptions={churchRoleOptions} />
        </Form>
      </Drawer>
    </>
  );
};

export default MembersTab;
