"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { useGetAlbumsInfinite } from "@/react-query";
import { Button, Flex, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { AlbumCard } from "./AlbumCard";
import styles from "./Albums.module.scss";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const { Title } = Typography;

export const Albums = () => {
  const router = useRouter();
  const { data, isLoading, hasNextPage } = useGetAlbumsInfinite({ limit: 12 });
  const { ref, isVisible } = useScrollReveal();

  if (isLoading) {
    return (
      <section className={styles.sectionLoading}>
        <div className={styles.container}>
          <Flex justify="center" align="center" className={styles.loadingArea}>
            <Spin size="large" />
          </Flex>
        </div>
      </section>
    );
  }

  const albums = data?.pages?.flatMap((page) => page?.albums ?? []) ?? [];

  if (!albums.length) return null;

  return (
    <section
      ref={ref}
      className={`${styles.section} scroll-reveal ${
        isVisible ? "scroll-reveal--visible" : ""
      }`}
    >
      <div className={`${styles.container} ${styles.containerWide}`}>
        <Flex vertical align="center" className={styles.heading}>
          <Title level={2} className={styles.title}>
            Galeria de Fotos
          </Title>
          <Typography.Text className={styles.subtitle}>
            Explore nossos álbuns de fotos e momentos especiais
          </Typography.Text>
        </Flex>

        <div className={styles.grid}>
          {albums.slice(0, 6).map((album) => (
            <AlbumCard
              {...album}
              key={album.id}
              basePath={`/${RoutesEnums.Gallery}`}
            />
          ))}
        </div>

        {(albums.length > 6 || hasNextPage) && (
          <Flex justify="center">
            <Button
              type="primary"
              size="large"
              onClick={() => router.push(`/${RoutesEnums.Gallery}`)}
              className={styles.buttonShadow}
            >
              Ver Todos os Álbuns
            </Button>
          </Flex>
        )}
      </div>
    </section>
  );
};
