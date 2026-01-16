"use client";

import { useGetAuditLogs } from "@/react-query";
import { useAuth } from "@/store";
import { AuditLogEntry } from "@/types/audit";
import { UserRole } from "@/types/user";
import {
  Card,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

const { Text, Title } = Typography;

const formatActor = (entry: AuditLogEntry) =>
  entry.actor?.email || entry.actor?.uid || "Sistema";

const formatTarget = (entry: AuditLogEntry) => {
  if (!entry.targetType && !entry.targetId) return "—";
  if (entry.targetType && entry.targetId) {
    return `${entry.targetType}: ${entry.targetId}`;
  }
  return entry.targetType || entry.targetId || "—";
};

const formatMetadata = (metadata?: Record<string, unknown>) => {
  if (!metadata || Object.keys(metadata).length === 0) return "—";
  const serialized = JSON.stringify(metadata);
  return serialized.length > 120
    ? `${serialized.slice(0, 120)}...`
    : serialized;
};

export const AuditLogsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === UserRole.Admin;
  const { data: logs = [], isLoading } = useGetAuditLogs(200, isAdmin);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string | undefined>();

  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(logs.map((log) => log.action))).sort();
    return actions.map((action) => ({ label: action, value: action }));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (actionFilter && log.action !== actionFilter) {
        return false;
      }
      if (!term) return true;
      return [
        log.action,
        log.targetType,
        log.targetId,
        log.actor?.email,
        log.actor?.uid,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [actionFilter, logs, search]);

  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: "Ação",
      dataIndex: "action",
      key: "action",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Alvo",
      key: "target",
      render: (_: unknown, record: AuditLogEntry) => formatTarget(record),
    },
    {
      title: "Responsável",
      key: "actor",
      render: (_: unknown, record: AuditLogEntry) => formatActor(record),
    },
    {
      title: "Data/Hora",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value?: string | null) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—",
    },
    {
      title: "Detalhes",
      key: "metadata",
      render: (_: unknown, record: AuditLogEntry) => {
        const text = formatMetadata(record.metadata);
        return (
          <Tooltip title={text !== "—" ? text : undefined}>
            <Text ellipsis style={{ maxWidth: 240, display: "inline-block" }}>
              {text}
            </Text>
          </Tooltip>
        );
      },
    },
  ];

  if (!isAdmin) {
    return <Empty description="Sem permissão para visualizar esta área." />;
  }

  return (
    <Card>
      <Space orientation="vertical" size={16} className="w-full">
        <Title level={3} style={{ marginBottom: 0 }}>
          Auditoria
        </Title>
        <Space wrap>
          <Input.Search
            placeholder="Buscar por ação, alvo ou usuário..."
            allowClear
            onSearch={(value) => setSearch(value)}
            onChange={(event) => setSearch(event.target.value)}
            style={{ minWidth: 260 }}
            value={search}
          />
          <Select
            allowClear
            placeholder="Filtrar ação"
            options={actionOptions}
            value={actionFilter}
            onChange={(value) => setActionFilter(value)}
            style={{ minWidth: 220 }}
          />
        </Space>
        <Table
          rowKey={(record) => record.id}
          dataSource={filteredLogs}
          columns={columns}
          loading={isLoading}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: "Nenhum registro de auditoria encontrado.",
          }}
        />
      </Space>
    </Card>
  );
};
