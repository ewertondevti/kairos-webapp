"use client";

import AppLayout from "@/components/AppLayout";
import Management from "@/components/pages/Management";
import { EventsTab } from "@/components/pages/Management/tabs/EventsTab";

export default function ManagementEventsPage() {
  return (
    <AppLayout>
      <Management>
        <EventsTab />
      </Management>
    </AppLayout>
  );
}
