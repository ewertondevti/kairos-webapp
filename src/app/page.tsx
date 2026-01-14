"use client";

import AppLayout from "@/components/AppLayout";
import { CustomFooter } from "@/components/CustomFooter";
import { Donation } from "@/components/Donation";
import { Row } from "antd";
import { Suspense } from "react";
import { Events } from "@/components/pages/Home/Events";
import { Verse } from "@/components/pages/Home/Verse";
import { WorshipDays } from "@/components/pages/Home/WorshipDays";

export default function HomePage() {
  return (
    <AppLayout>
      <Row className="overflow-y-auto">
        <Events />
        <Suspense fallback={<div>Carregando...</div>}>
          <Verse />
        </Suspense>
        <WorshipDays />
        <Donation />
        <CustomFooter />
      </Row>
    </AppLayout>
  );
}
