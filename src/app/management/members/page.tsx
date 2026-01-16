"use client";

import AppLayout from "@/components/AppLayout";
import Management from "@/pages/Management";
import { MembersTab } from "@/pages/Management/tabs/MembersTab";

export default function ManagementMembersPage() {
  return (
    <AppLayout>
      <Management>
        <MembersTab />
      </Management>
    </AppLayout>
  );
}
