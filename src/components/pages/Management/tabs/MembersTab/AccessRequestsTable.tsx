import { AccessRequest } from "@/services/userServices";
import { Button, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";

type AccessRequestsTableProps = {
  requests: AccessRequest[];
  isMobile: boolean;
  onCreateFromRequest: (request: AccessRequest) => void;
  onRejectRequest: (request: AccessRequest) => void;
};

export const AccessRequestsTable = ({
  requests,
  isMobile,
  onCreateFromRequest,
  onRejectRequest,
}: AccessRequestsTableProps) => {
  const columns: ColumnsType<AccessRequest> = [
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
        <Space>
          <Button type="primary" onClick={() => onCreateFromRequest(record)}>
            Aceitar
          </Button>
          <Popconfirm
            title="Recusar solicitação?"
            description="Esta ação remove a solicitação."
            okText="Recusar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => onRejectRequest(record)}
          >
            <Button danger>Recusar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={4}>Solicitações de acesso</Title>
      <Table
        style={{ marginBottom: 24 }}
        rowKey={(record) => record.id}
        dataSource={requests}
        columns={columns}
        locale={{
          emptyText: "Nenhuma solicitação pendente.",
        }}
        scroll={{ x: "max-content" }}
        size={isMobile ? "small" : "middle"}
      />
    </>
  );
};
