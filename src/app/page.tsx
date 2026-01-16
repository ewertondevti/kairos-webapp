"use client";

import AppLayout from "@/components/AppLayout";
import { CustomFooter } from "@/components/CustomFooter";
import { Donation } from "@/components/Donation";
import { Suspense } from "react";
import { Events } from "@/components/pages/Home/Events";
import { Verse } from "@/components/pages/Home/Verse";
import { WorshipDays } from "@/components/pages/Home/WorshipDays";
import { Hero } from "@/components/pages/Home/Hero";
import { Albums } from "@/components/pages/Home/Albums";

export default function HomePage() {
  return (
    <AppLayout>
      <main className="min-h-screen">
        <Hero />
        <Events />
        <Albums />
        <Suspense fallback={<div className="py-16 text-center">Carregando...</div>}>
          <Verse />
        </Suspense>
        <WorshipDays />
        <Donation />
        <CustomFooter />
      </main>
    </AppLayout>
  );
}
