"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { useGetAlbums } from "@/react-query";
import { Button, Flex, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { AlbumCard } from "./AlbumCard";

const { Title } = Typography;

export const Albums = () => {
  const router = useRouter();
  const { data: albums, isLoading } = useGetAlbums();

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#0a0a0a] via-[#0f3a1c] to-[#1a5d2e]">
        <div className="container mx-auto px-4">
          <Flex justify="center" align="center" className="min-h-[400px]">
            <Spin size="large" />
          </Flex>
        </div>
      </section>
    );
  }

  if (!albums?.length) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-[#0a0a0a] via-[#0f3a1c] to-[#1a5d2e]">
      <div className="container mx-auto px-4 max-w-7xl">
        <Flex vertical align="center" className="mb-16">
          <Title
            level={2}
            className="mb-5 text-white!"
            style={{
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontFamily: "var(--font-poppins), sans-serif",
              fontWeight: 700,
            }}
          >
            Galeria de Fotos
          </Title>
          <Typography.Text className="text-white/80!" style={{ fontSize: 16 }}>
            Explore nossos álbuns de fotos e momentos especiais
          </Typography.Text>
        </Flex>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {albums.slice(0, 6).map((album) => (
            <AlbumCard
              {...album}
              key={album.id}
              basePath={`/${RoutesEnums.Gallery}`}
            />
          ))}
        </div>

        {albums.length > 6 && (
          <Flex justify="center">
            <Button
              type="primary"
              size="large"
              onClick={() => router.push(`/${RoutesEnums.Gallery}`)}
              style={{
                boxShadow: "0 4px 12px rgba(26, 93, 46, 0.3)",
              }}
            >
              Ver Todos os Álbuns
            </Button>
          </Flex>
        )}
      </div>
    </section>
  );
};
