import { UserProfile } from "@/types/user";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table/interface";

type UsersTableProps = {
  users: UserProfile[];
  columns: ColumnsType<UserProfile>;
  isLoading: boolean;
  isMobile: boolean;
};

export const UsersTable = ({
  users,
  columns,
  isLoading,
  isMobile,
}: UsersTableProps) => {
  return (
    <Table
      style={{ marginTop: 16 }}
      childrenColumnName="__children"
      rowKey={(record) => record.authUid ?? record.id}
      loading={isLoading}
      dataSource={users}
      columns={columns}
      scroll={{ x: "max-content" }}
      size={isMobile ? "small" : "middle"}
    />
  );
};
