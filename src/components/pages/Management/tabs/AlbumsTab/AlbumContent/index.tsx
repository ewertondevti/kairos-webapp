"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { IAlbumDTO } from "@/types/store";
import { useRouter } from "next/navigation";
import { CSSProperties, FC } from "react";
import styles from "./AlbumContent.module.scss";

type Props = IAlbumDTO & {
  basePath?: string;
  index?: number;
};

export const AlbumContent: FC<Props> = ({
  id,
  name,
  images,
  basePath = "",
  index = 0,
}) => {
  const router = useRouter();
  const rotationOptions = [-1.5, 1.2, -0.8, 1.4, -1.1, 0.9];
  const tilt = rotationOptions[index % rotationOptions.length];
  const cardStyle = { ["--tilt"]: `${tilt}deg` } as CSSProperties;

  const coverImage = images?.[0]?.url;

  const onRedirect = () => router.push(`${basePath}/${id}`);

  return (
    <button
      type="button"
      onClick={onRedirect}
      className={styles.albumButton}
      aria-label={`Abrir álbum ${name}`}
    >
      <div className={styles.card} style={cardStyle}>
        <div className={styles.cardBody}>
          <div className={styles.imageFrame}>
            {coverImage ? (
              <OptimizedImage
                src={coverImage}
                alt={name}
                className={styles.image}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span className={styles.imagePlaceholderText}>Sem imagem</span>
              </div>
            )}
          </div>
          <div className={styles.caption}>{name}</div>
        </div>
      </div>
    </button>
  );
};
