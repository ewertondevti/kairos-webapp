"use client";

import AppLayout from "@/components/AppLayout";
import Management from "@/pages/Management";
import { AlbumsTab } from "@/pages/Management/tabs/AlbumsTab";

export default function ManagementAlbumsPage() {
  return (
    <AppLayout>
      <Management>
        <AlbumsTab />
      </Management>
    </AppLayout>
  );
}
