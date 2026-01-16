"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { downloadImagesAsZip } from "@/helpers/app";
import { useGetAlbumImagesIndexInfinite } from "@/react-query";
import { QueryNames } from "@/react-query/queryNames";
import { deleteImageFromAlbum } from "@/services/albumServices";
import { deleteUploadedImage } from "@/services/commonServices";
import { MediaImageItem } from "@/types/media";
import {
  AppstoreOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  DownloadOutlined,
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
import styles from "./Images.module.scss";

const { Title, Text } = Typography;

const formatDate = (value?: string) => {
  if (!value) return "Sem data";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sem data";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export const MediaImagesPage = () => {
  const {
    data,
    isLoading: isImagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAlbumImagesIndexInfinite({ limit: 48 });
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<MediaImageItem[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const imageItems = useMemo<MediaImageItem[]>(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((page) => page?.images ?? []);
  }, [data?.pages]);

  const getImageKey = (image: MediaImageItem) =>
    image.storagePath || image.id;

  const toggleSelection = (image: MediaImageItem) => {
    const key = getImageKey(image);
    const isSelected = selectedImages.some((img) => getImageKey(img) === key);
    if (isSelected) {
      setSelectedImages(
        selectedImages.filter((img) => getImageKey(img) !== key)
      );
      return;
    }
    setSelectedImages([...selectedImages, image]);
  };

  const onSelectAll = () => {
    if (!imageItems.length) return;
    if (selectedImages.length === imageItems.length) {
      setSelectedImages([]);
      return;
    }
    setSelectedImages(imageItems);
  };

  const onCancelSelection = () => {
    setSelectedImages([]);
    setIsSelecting(false);
  };

  const onDownloadSelected = async () => {
    if (!selectedImages.length) return;
    await downloadImagesAsZip(selectedImages, "imagens-selecionadas");
  };

  const onDeleteSelectedImages = () => {
    if (!selectedImages.length) return;
    const names = selectedImages.map(
      (image, index) => image.name || `Imagem ${index + 1}`
    );

    modal.confirm({
      title: "Apagar imagens",
      content: (
        <Flex vertical gap={12}>
          <Text>As imagens serão removidas do storage e desassociadas do álbum.</Text>
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
          const results = await Promise.allSettled(
            selectedImages.map((image) => deleteUploadedImage(image.storagePath))
          );
          const deletableImages = selectedImages.filter(
            (_, index) => results[index].status === "fulfilled"
          );

          const grouped = deletableImages.reduce<Record<string, MediaImageItem[]>>(
            (acc, image) => {
              if (!image.albumId) return acc;
              if (!acc[image.albumId]) acc[image.albumId] = [];
              acc[image.albumId].push(image);
              return acc;
            },
            {}
          );

          await Promise.all(
            Object.entries(grouped).map(([albumId, images]) =>
              deleteImageFromAlbum({
                albumId,
                images,
              })
            )
          );

          message.success("Imagens removidas com sucesso!");
          onCancelSelection();
          queryClient.invalidateQueries({ queryKey: [QueryNames.GetAlbumById] });
          queryClient.invalidateQueries({ queryKey: [QueryNames.GetAlbumsPaged] });
          queryClient.invalidateQueries({ queryKey: [QueryNames.GetAlbumImages] });
        } catch (error) {
          console.error(error);
          message.error("Não foi possível remover as imagens.");
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
            Imagens
          </Title>
          <Text className={styles.subtitle}>
            Visualize e gerencie as imagens armazenadas
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
                {selectedImages.length === imageItems.length
                  ? "Desselecionar todas"
                  : "Selecionar todas"}
              </Button>
              <Button onClick={onCancelSelection} className={styles.actionButton}>
                Cancelar
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={onDownloadSelected}
                disabled={!selectedImages.length}
                className={styles.actionButton}
              >
                Baixar selecionadas
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={onDeleteSelectedImages}
                disabled={!selectedImages.length}
                loading={isDeleting}
                className={styles.actionButton}
              >
                Apagar
              </Button>
            </>
          )}
        </Space>
      </Flex>

      {!isImagesLoading && !imageItems.length && (
        <Empty description="Nenhuma imagem encontrada" className={styles.empty} />
      )}

      {viewMode === "grid" ? (
        <div className={styles.grid}>
          {imageItems.map((image, index) => {
            const isSelected = selectedImages.some(
              (item) => getImageKey(item) === getImageKey(image)
            );
            return (
              <button
                key={getImageKey(image)}
                type="button"
                className={[styles.card, isSelected ? styles.selected : ""].join(" ")}
                onClick={() => {
                  if (isSelecting) {
                    toggleSelection(image);
                    return;
                  }
                  setPreviewIndex(index);
                  setIsPreviewOpen(true);
                }}
              >
                <div className={styles.thumbnail}>
                  <OptimizedImage
                    src={image.url}
                    alt={image.name || "Imagem"}
                    className={styles.thumbnailImage}
                  />
                </div>
                <div className={styles.cardBody}>
                  <Text className={styles.cardTitle}>{image.name || "Imagem"}</Text>
                  <Text className={styles.cardMeta}>
                    {image.albumName || "Sem álbum"}
                  </Text>
                  <Text className={styles.cardMeta}>
                    {formatDate(image.eventDate)}
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
          {imageItems.map((image, index) => {
            const isSelected = selectedImages.some(
              (item) => getImageKey(item) === getImageKey(image)
            );
            return (
              <button
                key={getImageKey(image)}
                type="button"
                className={[styles.listItem, isSelected ? styles.selected : ""].join(" ")}
                onClick={() => {
                  if (isSelecting) {
                    toggleSelection(image);
                    return;
                  }
                  setPreviewIndex(index);
                  setIsPreviewOpen(true);
                }}
              >
                <div className={styles.listThumb}>
                  <OptimizedImage
                    src={image.url}
                    alt={image.name || "Imagem"}
                    className={styles.listThumbImage}
                  />
                </div>
                <div className={styles.listContent}>
                  <Text className={styles.listTitle}>{image.name || "Imagem"}</Text>
                  <Text className={styles.listMeta}>
                    {image.albumName || "Sem álbum"}
                  </Text>
                  <Text className={styles.listMeta}>
                    {formatDate(image.eventDate)}
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

      {hasNextPage && (
        <Flex justify="center" className={styles.loadMore}>
          <Button
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            className={styles.actionButton}
          >
            Carregar mais
          </Button>
        </Flex>
      )}

      {imageItems.length > 0 && (
        <Image.PreviewGroup
          preview={{
            current: previewIndex,
            open: isPreviewOpen,
            onOpenChange: (open) => setIsPreviewOpen(open),
            onChange: (current) => setPreviewIndex(current),
          }}
        >
          {imageItems.map((image) => (
            <Image
              key={getImageKey(image)}
              src={image.url}
              alt={image.name || "Imagem"}
              className={styles.previewHidden}
            />
          ))}
        </Image.PreviewGroup>
      )}
    </div>
  );
};
