"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { IAlbumDTO } from "@/types/store";
import { Card, Typography } from "antd";
import { useRouter } from "next/navigation";
import { FC } from "react";

const { Paragraph } = Typography;

type Props = IAlbumDTO & {
  basePath?: string;
};

export const AlbumContent: FC<Props> = ({
  id,
  name,
  images,
  basePath = "",
}) => {
  const router = useRouter();

  const coverImage = images?.[0]?.url;

  const onRedirect = () => router.push(`${basePath}/${id}`);

  return (
    <Card
      hoverable
      onClick={onRedirect}
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      cover={
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {coverImage ? (
            <OptimizedImage
              src={coverImage}
              alt={name}
              className="w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      }
      bodyStyle={{ padding: "16px" }}
    >
      <Paragraph
        className="mb-0 text-center font-semibold text-black group-hover:text-primary transition-colors duration-300"
        ellipsis={{ rows: 2, tooltip: name }}
      >
        {name}
      </Paragraph>
    </Card>
  );
};
