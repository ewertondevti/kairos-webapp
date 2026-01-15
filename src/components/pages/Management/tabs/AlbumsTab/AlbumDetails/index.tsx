"use client";

import { ImagesSkeleton } from "@/components/ImagesSkeleton";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useGetAlbumImagesInfinite } from "@/react-query";
import { IAlbumWithCursor } from "@/types/store";
import { Empty } from "antd";
import Image from "antd/es/image";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AlbumDetails.module.scss";

type AlbumDetailsProps = {
  albumId?: string;
  initialAlbum?: IAlbumWithCursor;
};

export const AlbumDetails = ({ albumId, initialAlbum }: AlbumDetailsProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAlbumImagesInfinite(albumId, {
    limit: 24,
    initialPage: initialAlbum,
    enabled: !!albumId,
  });
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const albumImages = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((page) => page?.images ?? []);
  }, [data?.pages]);

  const images = useMemo(() => {
    if (!albumImages.length) return [];
    return albumImages.map((img) => ({
      src: img.url,
      alt: img.name || "Imagem",
    }));
  }, [albumImages]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading && !albumImages.length) {
    return <ImagesSkeleton />;
  }

  if (!albumImages.length) {
    return <Empty className={styles.empty} description="Nenhuma imagem encontrada" />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.masonry}>
        {albumImages.map((image, index) => (
          <button
            key={image.url}
            type="button"
            className={styles.item}
            onClick={() => {
              setPreviewIndex(index);
              setIsPreviewOpen(true);
            }}
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
              <div className={styles.infoLine} />
              <div className={styles.cornerAccent} />
            </div>
          </button>
        ))}
      </div>

      {hasNextPage && (
        <div ref={loadMoreRef} className="h-8 w-full" aria-hidden />
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
