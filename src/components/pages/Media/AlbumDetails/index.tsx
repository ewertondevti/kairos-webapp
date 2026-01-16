"use client";

import { EditAlbumModal } from "@/components/EditAlbumModal";
import { ImagesSkeleton } from "@/components/ImagesSkeleton";
import { OptimizedImage } from "@/components/OptimizedImage";
import { DatabaseTableKeys } from "@/enums/app";
import { downloadImagesAsZip } from "@/helpers/app";
import { QueryNames } from "@/react-query/queryNames";
import { useGetAlbumById, useGetAlbumImagesInfinite } from "@/react-query";
import { deleteAlbum, deleteImageFromAlbum } from "@/services/albumServices";
import { deleteUploadedImage } from "@/services/commonServices";
import { useAppState } from "@/store";
import { IImageDTO } from "@/types/store";
import {
  ArrowLeftOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Checkbox,
  Empty,
  Flex,
  Grid,
  List,
  Space,
  Typography,
} from "antd";
import Image from "antd/es/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AlbumDetails.module.scss";

const { Title, Text } = Typography;

type MediaAlbumDetailsPageProps = {
  albumId: string;
};

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

export const MediaAlbumDetailsPage = ({ albumId }: MediaAlbumDetailsPageProps) => {
  const [selectedImages, setSelectedImages] = useState<IImageDTO[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { modal, message } = App.useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { toogleEditAlbumModal } = useAppState();

  const { data: albumData } = useGetAlbumById(albumId, { limit: 1 });
  const {
    data,
    isLoading: isAlbumLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAlbumImagesInfinite(albumId, { limit: 24 });

  const albumImages = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((page) => page?.images ?? []);
  }, [data?.pages]);

  const albumName =
    albumData?.name?.trim() || data?.pages?.[0]?.name?.trim() || "Sem nome";
  const albumImagesCount =
    albumData?.imagesCount ??
    data?.pages?.[0]?.imagesCount ??
    albumImages.length;

  const getImageKey = (image: IImageDTO) =>
    image.storagePath || image.id || image.url;

  const onCancelSelection = () => {
    setSelectedImages([]);
    setIsSelecting(false);
  };

  const onSelectAll = () => {
    if (!albumImages.length) return;
    if (selectedImages.length === albumImages.length) {
      setSelectedImages([]);
      return;
    }
    setSelectedImages(albumImages);
  };

  const toggleSelection = (image: IImageDTO) => {
    const key = getImageKey(image);
    const isSelected = selectedImages.some((img) => getImageKey(img) === key);
    if (isSelected) {
      setSelectedImages(selectedImages.filter((img) => getImageKey(img) !== key));
      return;
    }
    setSelectedImages([...selectedImages, image]);
  };

  const refreshAlbumQueries = () => {
    queryClient.invalidateQueries({ queryKey: [QueryNames.GetAlbumById] });
  };

  const onDeleteAlbum = () => {
    modal.confirm({
      title: "Apagar álbum",
      content: (
        <Flex vertical gap={12}>
          <Text>Tem certeza que deseja apagar este álbum?</Text>
          <Text strong>{albumName}</Text>
        </Flex>
      ),
      okText: "Apagar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        setIsLoading(true);
        try {
          await deleteAlbum(albumId);
          message.success("Álbum apagado com sucesso!");
          router.push("/midia/albums");
          refreshAlbumQueries();
        } catch (error) {
          console.error(error);
          message.error("Não foi possível apagar o álbum.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const onDownloadAlbum = async () => {
    await downloadImagesAsZip(albumImages, albumName);
  };

  const onDownloadSelected = async () => {
    if (!selectedImages.length) return;
    await downloadImagesAsZip(
      selectedImages,
      `${albumName}-selecionadas`
    );
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
          <Text>As imagens serão removidas do storage e do álbum.</Text>
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
        setIsLoading(true);
        try {
          const results = await Promise.allSettled(
            selectedImages.map((image) =>
              deleteUploadedImage(
                image.storagePath ||
                  `${DatabaseTableKeys.Images}/${image.name}`
              )
            )
          );
          const deletableImages = selectedImages.filter(
            (_, index) => results[index].status === "fulfilled"
          );
          if (deletableImages.length) {
            await deleteImageFromAlbum({
              albumId,
              images: deletableImages,
            });
          }
          message.success("Imagens removidas com sucesso!");
          onCancelSelection();
          refreshAlbumQueries();
        } catch (error) {
          console.error(error);
          message.error("Não foi possível remover as imagens.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  if (isAlbumLoading && !albumImages.length) {
    return <ImagesSkeleton />;
  }

  if (!albumImages.length) {
    return (
      <Empty
        className={styles.empty}
        description="Nenhuma imagem encontrada"
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/midia/albums")}
          className={styles.backButton}
        >
          Voltar
        </Button>

        <div className={styles.headerInfo}>
          <Title level={3} className={styles.title}>
            {albumName}
          </Title>
          <Flex gap={12} wrap>
            <Text className={styles.metaText}>
              {formatDate(albumData?.eventDate)}
            </Text>
            <Text className={styles.metaText}>
              {albumImagesCount} imagens
            </Text>
          </Flex>
        </div>
      </div>

      <Flex justify="space-between" align="center" wrap className={styles.actions}>
        <Space wrap size={8} className={styles.actionsGroup}>
          <Button
            icon={<EditOutlined />}
            onClick={() => toogleEditAlbumModal(true)}
            className={styles.actionButton}
          >
            Editar álbum
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onDeleteAlbum}
            loading={isLoading}
            className={styles.actionButton}
          >
            Apagar álbum
          </Button>
        </Space>

        <Space wrap size={8} className={styles.actionsGroup}>
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
                {selectedImages.length === albumImages.length
                  ? "Desselecionar todas"
                  : "Selecionar todas"}
              </Button>
              <Button onClick={onCancelSelection} className={styles.actionButton}>
                Cancelar
              </Button>
            </>
          )}
          <Button
            icon={<DownloadOutlined />}
            onClick={onDownloadAlbum}
            className={styles.actionButton}
          >
            Baixar álbum
          </Button>
          {isSelecting && (
            <>
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
                className={styles.actionButton}
              >
                Apagar imagens
              </Button>
            </>
          )}
        </Space>
      </Flex>

      <div className={styles.grid}>
        {albumImages.map((image, index) => {
          const isSelected = selectedImages.some(
            (img) => getImageKey(img) === getImageKey(image)
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
              <div className={styles.cardFooter}>
                <Text className={styles.cardText}>{image.name || "Imagem"}</Text>
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

      <EditAlbumModal />

      {albumImages.length > 0 && (
        <Image.PreviewGroup
          preview={{
            current: previewIndex,
            open: isPreviewOpen,
            onOpenChange: (open) => setIsPreviewOpen(open),
            onChange: (current) => setPreviewIndex(current),
          }}
        >
          {albumImages.map((image) => (
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
