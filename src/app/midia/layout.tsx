"use client";

import "../globals.scss";
import PortalLayout from "@/components/PortalLayout";
import { mediaPortalNav } from "@/config/portalNavigation";
import { UserRole } from "@/features/auth/auth.enums";

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      title="Portal de Mídia"
      subtitle="Gestão de álbuns, imagens e eventos"
      navItems={mediaPortalNav}
      allowedRoles={[UserRole.Midia, UserRole.Admin]}
    >
      {children}
    </PortalLayout>
  );
}
