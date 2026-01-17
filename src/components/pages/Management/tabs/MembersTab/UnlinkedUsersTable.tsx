import { UserProfile } from "@/types/user";
import { Button, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import Title from "antd/es/typography/Title";

type UnlinkedUsersTableProps = {
  users: UserProfile[];
  isLoading: boolean;
  isMobile: boolean;
  onCreateAuth: (user: UserProfile) => void;
  onEdit: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
};

export const UnlinkedUsersTable = ({
  users,
  isLoading,
  isMobile,
  onCreateAuth,
  onEdit,
  onDelete,
}: UnlinkedUsersTableProps) => {
  const columns: ColumnsType<UserProfile> = [
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
      title: "Ações",
      key: "actions",
      render: (_: unknown, record: UserProfile) => (
        <Space>
          <Button
            type="primary"
            onClick={() => onCreateAuth(record)}
            disabled={!record.email?.trim() || !record.fullname?.trim()}
          >
            Criar auth
          </Button>
          <Button onClick={() => onEdit(record)}>Editar</Button>
          <Popconfirm
            title="Apagar usuário?"
            description="Esta ação remove o registro da collection."
            okText="Apagar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record)}
          >
            <Button danger>Apagar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={4}>Usuários sem autenticação</Title>
      <Table
        style={{ marginBottom: 24 }}
        rowKey={(record) => record.id}
        loading={isLoading}
        dataSource={users}
        columns={columns}
        locale={{
          emptyText: "Nenhum usuário sem auth encontrado.",
        }}
        scroll={{ x: "max-content" }}
        size={isMobile ? "small" : "middle"}
      />
    </>
  );
};
