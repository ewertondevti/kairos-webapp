"use client";

import { IAlbumDTO } from "@/types/store";
import { Card, Typography } from "antd";
import { useRouter } from "next/navigation";
import { FC } from "react";

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
      className="cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden"
      bodyStyle={{ padding: 0 }}
      onClick={onRedirect}
    >
      <div className="relative w-full aspect-square overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-4xl">📷</div>
          </div>
        )}
      </div>
      <div className="p-4 text-center">
        <Text className="text-base font-medium">{name}</Text>
      </div>
    </Card>
  );
};
