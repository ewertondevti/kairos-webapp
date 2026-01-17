"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { CreateAlbumModal } from "@/components/pages/Management/CreateAlbumModal";
import { useGetAlbumsInfinite } from "@/react-query";
import { useAuth } from "@/store";
import { MediaAlbumSummary } from "@/types/media";
import { UserRole } from "@/features/auth/auth.enums";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Empty,
  Flex,
  Grid,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./Albums.module.scss";

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

export const MediaAlbumsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAlbumsInfinite({ limit: 18 });
  const { user, role, active } = useAuth();
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const canManageMedia =
    !!user && !!active && (role === UserRole.Midia || role === UserRole.Admin);

  const albumSummaries = useMemo<MediaAlbumSummary[]>(() => {
    const pages = data?.pages ?? [];
    const albums = pages.flatMap((page) => page?.albums ?? []);
    if (!albums.length) return [];
    return albums.map((album) => ({
      id: album.id ?? "",
      name: album.name,
      eventDate: album.eventDate,
      imagesCount: album.imagesCount ?? 0,
      coverUrl: album.coverUrl,
    }));
  }, [data?.pages]);

  return (
    <div className={styles.page}>
      <Flex justify="space-between" align="center" wrap className={styles.header}>
        <div>
          <Title level={3} className={styles.title}>
            Álbuns
          </Title>
          <Text className={styles.subtitle}>
            Organize coleções de mídia e detalhes do evento
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
          {canManageMedia && (
            <Button
              type="primary"
              size={isMobile ? "middle" : "large"}
              onClick={() => setIsModalOpen(true)}
              className={styles.createButton}
            >
              Criar álbum
            </Button>
          )}
        </Space>
      </Flex>

      {!isLoading && !albumSummaries.length && (
        <Empty description="Nenhum álbum cadastrado" className={styles.empty} />
      )}

      {viewMode === "grid" ? (
        <div className={styles.grid}>
          {albumSummaries.map((album) => (
            <button
              key={album.id}
              type="button"
              className={styles.card}
              onClick={() => router.push(`/midia/albums/${album.id}`)}
            >
              <div className={styles.cover}>
                {album.coverUrl ? (
                  <OptimizedImage
                    src={album.coverUrl}
                    alt={album.name}
                    className={styles.coverImage}
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    <Text>Sem imagem</Text>
                  </div>
                )}
                <div className={styles.coverOverlay} />
              </div>
              <div className={styles.cardBody}>
                <Title level={5} className={styles.cardTitle}>
                  {album.name}
                </Title>
                <Flex gap={8} wrap className={styles.meta}>
                  <Tag className={styles.tag}>{formatDate(album.eventDate)}</Tag>
                  <Tag className={styles.tag}>
                    {album.imagesCount} imagens
                  </Tag>
                </Flex>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          {albumSummaries.map((album) => (
            <button
              key={album.id}
              type="button"
              className={styles.listItem}
              onClick={() => router.push(`/midia/albums/${album.id}`)}
            >
              <div className={styles.listThumb}>
                {album.coverUrl ? (
                  <OptimizedImage
                    src={album.coverUrl}
                    alt={album.name}
                    className={styles.listThumbImage}
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    <Text>Sem imagem</Text>
                  </div>
                )}
              </div>
              <div className={styles.listContent}>
                <Title level={5} className={styles.cardTitle}>
                  {album.name}
                </Title>
                <Flex gap={8} wrap className={styles.meta}>
                  <Tag className={styles.tag}>{formatDate(album.eventDate)}</Tag>
                  <Tag className={styles.tag}>
                    {album.imagesCount} imagens
                  </Tag>
                </Flex>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasNextPage && (
        <Flex justify="center" className={styles.loadMore}>
          <Button
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            className={styles.loadMoreButton}
          >
            Carregar mais
          </Button>
        </Flex>
      )}

      <CreateAlbumModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};
