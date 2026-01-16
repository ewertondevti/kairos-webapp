"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { EventModal } from "@/components/EventModal";
import { useGetEvents } from "@/react-query";
import { QueryNames } from "@/react-query/queryNames";
import { deleteEvents } from "@/services/eventServices";
import { MediaEventItem } from "@/types/media";
import {
  AppstoreOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Checkbox,
  Empty,
  Flex,
  List,
  Segmented,
  Space,
  Typography,
} from "antd";
import Image from "antd/es/image";
import { useMemo, useState } from "react";
import styles from "./Events.module.scss";

const { Title, Text } = Typography;

export const MediaEventsPage = () => {
  const { data: events, isLoading } = useGetEvents();
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<MediaEventItem[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const eventItems = useMemo<MediaEventItem[]>(() => events ?? [], [events]);

  const toggleSelection = (eventItem: MediaEventItem) => {
    const isSelected = selectedEvents.some((item) => item.id === eventItem.id);
    if (isSelected) {
      setSelectedEvents(selectedEvents.filter((item) => item.id !== eventItem.id));
      return;
    }
    setSelectedEvents([...selectedEvents, eventItem]);
  };

  const onSelectAll = () => {
    if (!eventItems.length) return;
    if (selectedEvents.length === eventItems.length) {
      setSelectedEvents([]);
      return;
    }
    setSelectedEvents(eventItems);
  };

  const onCancelSelection = () => {
    setSelectedEvents([]);
    setIsSelecting(false);
  };

  const onDeleteSelected = () => {
    if (!selectedEvents.length) return;
    const names = selectedEvents.map(
      (eventItem, index) => eventItem.name || `Evento ${index + 1}`
    );

    modal.confirm({
      title: "Apagar eventos",
      content: (
        <Flex vertical gap={12}>
          <Text>Os eventos selecionados serão removidos.</Text>
          <List
            size="small"
            bordered
            dataSource={names}
            style={{ maxHeight: 220, overflowY: "auto" }}
            renderItem={(name) => <List.Item>{name}</List.Item>}
          />
        </Flex>
      ),
      okText: "Apagar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        setIsDeleting(true);
        try {
          await deleteEvents({ images: selectedEvents });
          message.success("Eventos removidos com sucesso!");
          onCancelSelection();
          queryClient.invalidateQueries({ queryKey: [QueryNames.GetEvents] });
        } catch (error) {
          console.error(error);
          message.error("Não foi possível remover os eventos.");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return (
    <div className={styles.page}>
      <Flex justify="space-between" align="center" wrap className={styles.header}>
        <div>
          <Title level={3} className={styles.title}>
            Eventos
          </Title>
          <Text className={styles.subtitle}>
            Gerencie os próximos eventos exibidos na home
          </Text>
        </div>
        <Space wrap size={8} className={styles.actions}>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as "grid" | "list")}
            options={[
              { label: "Grid", value: "grid", icon: <AppstoreOutlined /> },
              { label: "Lista", value: "list", icon: <UnorderedListOutlined /> },
            ]}
            className={styles.viewToggle}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className={styles.actionButton}
          >
            Adicionar eventos
          </Button>
          {!isSelecting && (
            <Button
              icon={<CheckSquareOutlined />}
              onClick={() => setIsSelecting(true)}
              className={styles.actionButton}
            >
              Selecionar
            </Button>
          )}
          {isSelecting && (
            <>
              <Button onClick={onSelectAll} className={styles.actionButton}>
                {selectedEvents.length === eventItems.length
                  ? "Desselecionar todas"
                  : "Selecionar todas"}
              </Button>
              <Button onClick={onCancelSelection} className={styles.actionButton}>
                Cancelar
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={onDeleteSelected}
                disabled={!selectedEvents.length}
                loading={isDeleting}
                className={styles.actionButton}
              >
                Apagar
              </Button>
            </>
          )}
        </Space>
      </Flex>

      {!isLoading && !eventItems.length && (
        <Empty description="Nenhum evento cadastrado" className={styles.empty} />
      )}

      {viewMode === "grid" ? (
        <div className={styles.grid}>
          {eventItems.map((eventItem, index) => {
            const isSelected = selectedEvents.some((item) => item.id === eventItem.id);
            return (
              <button
                key={eventItem.id}
                type="button"
                className={[styles.card, isSelected ? styles.selected : ""].join(" ")}
                onClick={() => {
                  if (isSelecting) {
                    toggleSelection(eventItem);
                    return;
                  }
                  setPreviewIndex(index);
                  setIsPreviewOpen(true);
                }}
              >
                <div className={styles.thumbnail}>
                  <OptimizedImage
                    src={eventItem.url}
                    alt={eventItem.name || "Evento"}
                    className={styles.thumbnailImage}
                  />
                </div>
                <div className={styles.cardBody}>
                  <Text className={styles.cardTitle}>
                    {eventItem.name || "Evento"}
                  </Text>
                </div>
                {isSelecting && (
                  <div className={styles.checkbox}>
                    <Checkbox checked={isSelected} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.list}>
          {eventItems.map((eventItem, index) => {
            const isSelected = selectedEvents.some((item) => item.id === eventItem.id);
            return (
              <button
                key={eventItem.id}
                type="button"
                className={[styles.listItem, isSelected ? styles.selected : ""].join(" ")}
                onClick={() => {
                  if (isSelecting) {
                    toggleSelection(eventItem);
                    return;
                  }
                  setPreviewIndex(index);
                  setIsPreviewOpen(true);
                }}
              >
                <div className={styles.listThumb}>
                  <OptimizedImage
                    src={eventItem.url}
                    alt={eventItem.name || "Evento"}
                    className={styles.listThumbImage}
                  />
                </div>
                <div className={styles.listContent}>
                  <Text className={styles.cardTitle}>
                    {eventItem.name || "Evento"}
                  </Text>
                </div>
                {isSelecting && (
                  <div className={styles.listCheckbox}>
                    <Checkbox checked={isSelected} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {eventItems.length > 0 && (
        <Image.PreviewGroup
          preview={{
            current: previewIndex,
            open: isPreviewOpen,
            onOpenChange: (open) => setIsPreviewOpen(open),
            onChange: (current) => setPreviewIndex(current),
          }}
        >
          {eventItems.map((eventItem) => (
            <Image
              key={eventItem.id}
              src={eventItem.url}
              alt={eventItem.name || "Evento"}
              className={styles.previewHidden}
            />
          ))}
        </Image.PreviewGroup>
      )}

      <EventModal isOpen={isModalOpen} onCancel={() => setIsModalOpen(false)} />
    </div>
  );
};
