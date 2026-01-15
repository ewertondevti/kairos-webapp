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
      <div className={styles.frame}>
        <div className={styles.photoWrap}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={name}
              className={styles.photo}
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholder}>📷</div>
          )}
        </div>
        <div className={styles.label}>
          <Text className={styles.title}>{name}</Text>
        </div>
      </div>
    </Card>
  );
};
