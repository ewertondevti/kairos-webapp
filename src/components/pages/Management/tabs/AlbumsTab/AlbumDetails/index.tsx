"use client";

import { ImagesSkeleton } from "@/components/ImagesSkeleton";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { downloadImagesAsZip } from "@/helpers/app";
import { useGetAlbumById, useGetAlbumImagesInfinite } from "@/react-query";
import { deleteAlbum } from "@/services/albumServices";
import { useAppState, useAuth } from "@/store";
import { IAlbumWithCursor, IImageDTO } from "@/types/store";
import { UserRole } from "@/types/user";
import {
  CheckSquareOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Checkbox, Empty, Flex, message, Typography } from "antd";
import Image from "antd/es/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./AlbumDetails.module.scss";

type AlbumDetailsProps = {
  albumId?: string;
  initialAlbum?: IAlbumWithCursor;
};

export const AlbumDetails = ({ albumId, initialAlbum }: AlbumDetailsProps) => {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { modal } = App.useApp();
  const queryClient = useQueryClient();
  const { user, role, active } = useAuth();
  const { mode, selectedImages, updateSelectedImages, updateMode } =
    useAppState();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetAlbumImagesInfinite(albumId, {
      limit: 24,
      initialPage: initialAlbum,
      enabled: !!albumId,
    });
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isSelecting = mode === "select";
  const isAlbumsRoute = pathname.includes(ManagementRoutesEnums.Albums);
  const isGalleryRoute = pathname.includes(RoutesEnums.Gallery);
  const canManageMedia =
    !!user && !!active && (role === UserRole.Admin || role === UserRole.Midia);
  const { data: albumData } = useGetAlbumById(albumId, {
    enabled: !initialAlbum,
    limit: 1,
  });

  const albumImages = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((page) => page?.images ?? []);
  }, [data?.pages]);

  const albumName =
    initialAlbum?.name?.trim() || albumData?.name?.trim() || "Sem nome";

  const getImageKey = (image: IImageDTO) =>
    image.storagePath || image.id || image.url;

  const toggleSelection = (image: IImageDTO) => {
    const key = getImageKey(image);
    const isSelected = selectedImages.some((img) => getImageKey(img) === key);
    if (isSelected) {
      updateSelectedImages(
        selectedImages.filter((img) => getImageKey(img) !== key)
      );
      return;
    }

    updateSelectedImages([...selectedImages, image]);
  };

  const onCancelSelection = () => {
    updateSelectedImages([]);
    updateMode("default");
  };

  const onSelectAll = () => {
    if (!albumImages.length) return;
    if (selectedImages.length === albumImages.length) {
      updateSelectedImages([]);
      return;
    }
    updateSelectedImages(albumImages);
  };

  const openDeleteAlbumConfirm = () => {
    modal.confirm({
      title: "Apagar álbum",
      content: (
        <Flex vertical gap={12}>
          <Typography.Text>
            Tem certeza que deseja apagar este álbum? Todas as imagens serão
            removidas.
          </Typography.Text>
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">Álbum</Typography.Text>
            <Typography.Text strong>{albumName}</Typography.Text>
          </Flex>
        </Flex>
      ),
      okText: "Apagar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        if (!albumId) return;
        try {
          await deleteAlbum(albumId);
          message.success("Álbum apagado com sucesso!");
          await queryClient.refetchQueries();
          if (isAlbumsRoute) {
            router.push(
              `/${RoutesEnums.Management}/${ManagementRoutesEnums.Albums}`
            );
          } else if (isGalleryRoute) {
            router.push(`/${RoutesEnums.Gallery}`);
          }
          updateSelectedImages([]);
          updateMode("default");
        } catch (error) {
          console.error(error);
          message.error("Não foi possível apagar o álbum!");
        }
      },
    });
  };

  const onDownloadAlbum = async () => {
    await downloadImagesAsZip(albumImages, albumName);
  };

  const onDownloadSelected = async () => {
    if (!selectedImages.length) return;
    await downloadImagesAsZip(selectedImages, `${albumName}-selecionadas`);
  };

  const images = useMemo(() => {
    if (!albumImages.length) return [];
    return albumImages.map((img) => ({
      src: img.url,
      alt: img.name || "Imagem",
    }));
  }, [albumImages]);

  if (isLoading && !albumImages.length) {
    return <ImagesSkeleton />;
  }

  if (!albumImages.length) {
    return (
      <Empty className={styles.empty} description="Nenhuma imagem encontrada" />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.actions}>
        <Flex
          justify="space-between"
          align="center"
          wrap
          className={styles.actionsRow}
        >
          <Flex gap={8} wrap className={styles.actionsGroup}>
            {!isSelecting && (
              <Button
                icon={<CheckSquareOutlined />}
                onClick={() => updateMode("select")}
                type="default"
                className={styles.actionButton}
              >
                Selecionar
              </Button>
            )}
            {isSelecting && (
              <>
                <Button
                  icon={<CheckSquareOutlined />}
                  onClick={onSelectAll}
                  type="default"
                  className={styles.actionButton}
                >
                  {selectedImages.length === albumImages.length
                    ? "Desselecionar todas"
                    : "Selecionar todas"}
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={onCancelSelection}
                  className={styles.actionButton}
                >
                  Cancelar
                </Button>
              </>
            )}
          </Flex>
          <Flex gap={12} align="center" className={styles.actionsMeta}>
            {isSelecting && (
              <Typography.Text
                className={[
                  styles.actionsCount,
                  styles.actionsCountActive,
                ].join(" ")}
              >
                {`Selecionadas: ${selectedImages.length}`}
              </Typography.Text>
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={onDownloadAlbum}
              className={[styles.actionButton, styles.downloadButton].join(" ")}
            >
              Baixar álbum
            </Button>
            {isGalleryRoute && isSelecting && (
              <Button
                icon={<DownloadOutlined />}
                onClick={onDownloadSelected}
                disabled={!selectedImages.length}
                className={[styles.actionButton, styles.downloadButton].join(
                  " "
                )}
              >
                Baixar selecionadas
              </Button>
            )}
            {canManageMedia && !isGalleryRoute && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={openDeleteAlbumConfirm}
                className={styles.deleteAlbumButton}
              >
                Apagar álbum
              </Button>
            )}
          </Flex>
        </Flex>
      </div>
      <div className={styles.masonry}>
        {albumImages.map((image, index) => (
          <button
            key={getImageKey(image)}
            type="button"
            className={[
              styles.item,
              isSelecting ? styles.selecting : "",
              selectedImages.some(
                (img) => getImageKey(img) === getImageKey(image)
              )
                ? styles.selected
                : "",
            ].join(" ")}
            onClick={() => {
              if (isSelecting) {
                toggleSelection(image);
                return;
              }

              setPreviewIndex(index);
              setIsPreviewOpen(true);
            }}
            aria-pressed={
              isSelecting ?
                selectedImages.some(
                  (img) => getImageKey(img) === getImageKey(image)
                ) :
                undefined
            }
          >
            <div className={styles.card}>
              <div className={styles.shine} />
              <OptimizedImage
                src={image.url}
                alt={image.name || `Imagem ${index + 1}`}
                className={styles.image}
              />
              <div className={styles.overlay}>
                <p className={styles.caption}>Visualizar</p>
              </div>
              {isSelecting && (
                <>
                  <div className={styles.selectOverlay} />
                  <div className={styles.selectBadge}>
                    <Checkbox
                      checked={selectedImages.some(
                        (img) => getImageKey(img) === getImageKey(image)
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSelection(image);
                      }}
                    />
                    <span className={styles.selectLabel}>
                      {selectedImages.some(
                        (img) => getImageKey(img) === getImageKey(image)
                      )
                        ? "Selecionada"
                        : "Selecionar"}
                    </span>
                  </div>
                </>
              )}
              <div className={styles.infoLine} />
              <div className={styles.cornerAccent} />
            </div>
          </button>
        ))}
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

      {/* Image Preview Modal */}
      {images.length > 0 && (
        <Image.PreviewGroup
          preview={{
            current: previewIndex,
            open: isPreviewOpen,
            onOpenChange: (open) => setIsPreviewOpen(open),
            onChange: (current) => setPreviewIndex(current),
          }}
        >
          {images.map((img, idx) => (
            <Image
              key={idx}
              src={img.src}
              alt={img.alt}
              className={styles.previewHidden}
            />
          ))}
        </Image.PreviewGroup>
      )}
    </div>
  );
};
