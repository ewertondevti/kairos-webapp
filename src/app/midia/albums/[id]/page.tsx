"use client";

import { MediaAlbumDetailsPage } from "@/components/pages/Media/AlbumDetails";
import { use } from "react";

export default function MediaAlbumDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <MediaAlbumDetailsPage albumId={id} />;
}
