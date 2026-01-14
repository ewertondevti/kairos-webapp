"use client";

import AppLayout from "@/components/AppLayout";
import { Gallery } from "@/components/pages/Gallery";
import { use } from "react";

export default function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AppLayout>
      <Gallery albumId={id} />
    </AppLayout>
  );
}
