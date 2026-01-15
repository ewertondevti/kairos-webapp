"use client";

import { IAlbumDTO } from "@/types/store";
import { Card, Typography } from "antd";
import { useRouter } from "next/navigation";
import { FC } from "react";
import styles from "./AlbumCard.module.scss";

const { Text } = Typography;

type Props = IAlbumDTO & {
  basePath?: string;
};

export const AlbumCard: FC<Props> = ({
  id,
  name,
  images,
  basePath = "",
}) => {
  const router = useRouter();

  const onRedirect = () => router.push(`${basePath}/${id}`);

  const coverImage = images?.[0]?.url;

  return (
    <Card
      hoverable
      className={styles.card}
      styles={{ body: { padding: 0 } }}
      onClick={onRedirect}
    >
      <div className={styles.shine} />
      <div className={styles.imageWrap}>
        <div className={styles.imageOverlay} />
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>
            📷
          </div>
        )}
        <div className={styles.infoOverlay}>
          <div className={styles.infoText}>Ver album</div>
          <div className={styles.infoLine} />
        </div>
      </div>
      <div className={styles.cornerAccent} />
      <div className={styles.body}>
        <Text className={styles.title}>{name}</Text>
      </div>
    </Card>
  );
};
