"use client";

import AppLayout from "@/components/AppLayout";
import Management from "@/pages/Management";
import { AlbumsTab } from "@/pages/Management/tabs/AlbumsTab";
import { use } from "react";

export default function ManagementAlbumDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AppLayout>
      <Management>
        <AlbumsTab albumId={id} />
      </Management>
    </AppLayout>
  );
}
