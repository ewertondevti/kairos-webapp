"use client";

import AppLayout from "@/components/AppLayout";
import Management from "@/pages/Management";
import { EventsTab } from "@/pages/Management/tabs/EventsTab";

export default function ManagementEventsPage() {
  return (
    <AppLayout>
      <Management>
        <EventsTab />
      </Management>
    </AppLayout>
  );
}
