"use client";

import { ImagesSkeleton } from "@/components/ImagesSkeleton";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useGetAlbumById } from "@/react-query";
import { Empty } from "antd";
import Image from "antd/es/image";
import { useMemo, useState } from "react";
import styles from "./AlbumDetails.module.scss";

type AlbumDetailsProps = {
  albumId?: string;
};

export const AlbumDetails = ({ albumId }: AlbumDetailsProps) => {
  const { data: album, isLoading } = useGetAlbumById(albumId);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const images = useMemo(() => {
    if (!album?.images?.length) return [];
    return album.images.map((img) => ({
      src: img.url,
      alt: img.name || "Imagem",
    }));
  }, [album?.images]);

  if (isLoading) {
    return <ImagesSkeleton />;
  }

  if (!album?.images?.length) {
    return <Empty className={styles.empty} description="Nenhuma imagem encontrada" />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.masonry}>
        {album.images.map((image, index) => (
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

      {/* Image Preview Modal */}
      {images.length > 0 && (
        <Image.PreviewGroup
          preview={{
            current: previewIndex,
            visible: isPreviewOpen,
            onVisibleChange: (visible) => setIsPreviewOpen(visible),
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
