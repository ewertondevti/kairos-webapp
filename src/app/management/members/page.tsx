"use client";

import AppLayout from "@/components/AppLayout";
import Management from "@/components/pages/Management";
import { MembersTab } from "@/components/pages/Management/tabs/MembersTab";

export default function ManagementMembersPage() {
  return (
    <AppLayout>
      <Management>
        <MembersTab />
      </Management>
    </AppLayout>
  );
}
