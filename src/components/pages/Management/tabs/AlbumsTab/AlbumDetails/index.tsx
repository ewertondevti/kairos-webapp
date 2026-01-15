"use client";

import { ImagesSkeleton } from "@/components/ImagesSkeleton";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useGetAlbumById } from "@/react-query";
import { Empty } from "antd";
import Image from "antd/es/image";
import { useMemo, useState } from "react";

type AlbumDetailsProps = {
  albumId?: string;
};

export const AlbumDetails = ({ albumId }: AlbumDetailsProps) => {
  const { data: album, isLoading } = useGetAlbumById(albumId);
  const [previewIndex, setPreviewIndex] = useState(0);

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
    return <Empty className="mt-12" description="Nenhuma imagem encontrada" />;
  }

  return (
    <div className="w-full">
      {/* Masonry Grid Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {album.images.map((image, index) => (
          <div
            key={image.url}
            className="break-inside-avoid mb-4 group cursor-pointer"
            onClick={() => setPreviewIndex(index)}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100">
              <OptimizedImage
                src={image.url}
                alt={image.name || `Imagem ${index + 1}`}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white p-3 text-sm font-medium truncate w-full">
                  {image.name || `Imagem ${index + 1}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {images.length > 0 && (
        <Image.PreviewGroup
          preview={{
            current: previewIndex,
            onChange: (current) => setPreviewIndex(current),
          }}
        >
          {images.map((img, idx) => (
            <Image key={idx} src={img.src} alt={img.alt} className="hidden" />
          ))}
        </Image.PreviewGroup>
      )}
    </div>
  );
};
